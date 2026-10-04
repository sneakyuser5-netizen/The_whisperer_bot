const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { fbdown } = require("btch-downloader");
const session = require("../../lib/session");

function extractFacebookUrl(msg, args = []) {
    const text = (args[0] || "").trim();
    const urlFromArgs = text.match(/https?:\/\/(?:www\.|m\.)?(?:facebook\.com|fb\.watch)\/\S+/i);
    if (urlFromArgs) return urlFromArgs[0].replace(/[)\]}>.,]+$/, "");

    const context = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = context?.quotedMessage;
    if (!quoted) return null;

    const quotedText = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || quoted.videoMessage?.caption || "";
    const urlFromReply = quotedText.match(/https?:\/\/(?:www\.|m\.)?(?:facebook\.com|fb\.watch)\/\S+/i);
    if (urlFromReply) return urlFromReply[0].replace(/[)\]}>.,]+$/, "");
    return null;
}

function downloadFile(url, outputPath, redirects = 0) {
    return new Promise((resolve, reject) => {
        if (redirects > 10) return reject(new Error("Too many redirects."));
        const client = url.startsWith("https://")? https : http;
        const request = client.get(url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                const nextUrl = new URL(response.headers.location, url).toString();
                return downloadFile(nextUrl, outputPath, redirects + 1).then(resolve).catch(reject);
            }
            if (response.statusCode!== 200) {
                response.resume();
                return reject(new Error(`Download failed with HTTP ${response.statusCode}`));
            }
            const file = fs.createWriteStream(outputPath);
            response.pipe(file);
            file.on("finish", () => file.close(resolve));
            file.on("error", err => {
                file.destroy();
                try { fs.unlinkSync(outputPath); } catch {}
                reject(err);
            });
        });
        request.setTimeout(60000, () => request.destroy(new Error("Facebook download timed out.")));
        request.on("error", reject);
    });
}

module.exports = {
    name: "facebook",
    description: "Download a Facebook video",
    category: "media",
    permission: "sudo",
    usage: ".facebook <Facebook URL> or reply to a Facebook URL",
    minArgs: 0,
    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;
        let videoFile = null;
        let qualityInput = (args[1] || args[0] || "").toLowerCase().trim();
        let quality = null;
        if (["1", "hd"].includes(qualityInput)) quality = "hd";
        if (["2", "normal", "sd"].includes(qualityInput)) quality = "normal";
        let url = extractFacebookUrl(msg, args);
        const sess = session.get(jid);
        if (!url && sess?.type === "media_quality" && sess?.command === "facebook") {
            url = sess.url;
        }
        if (!url) {
            return sock.sendMessage(jid, { text: t(jid, "facebook_missing") });
        }
        if (!quality) {
            session.set(jid, {
                type: "media_quality",
                command: "facebook",
                url,
                expires: Date.now() + 60000
            });
            return sock.sendMessage(jid, { text: t(jid, "facebook_quality") });
        }
        if (sess?.command === "facebook") session.delete(jid);
        const mediaDir = path.join(__dirname, "../../media");
        if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
        videoFile = path.join(mediaDir, `facebook-${Date.now()}.mp4`);
        try {
            await sock.sendMessage(jid, { text: t(jid, "facebook_downloading") });
            console.log("🔎 Facebook URL:", url, "Quality:", quality);
            const result = await fbdown(url);
            if (!result || result.status === false) throw new Error("Facebook downloader failed.");
            const videoUrl = quality === "hd"? result.HD : result.Normal_video;
            if (!videoUrl) throw new Error(`Facebook ${quality} URL not returned.`);
            await downloadFile(videoUrl, videoFile);
            if (!fs.existsSync(videoFile) || fs.statSync(videoFile).size === 0) {
                throw new Error("Empty file.");
            }
            await sock.sendMessage(jid, {
                video: { url: videoFile },
                caption: t(jid, "facebook_success")
            });
        } catch (err) {
            console.error("❌ FACEBOOK ERROR:", err);
            await sock.sendMessage(jid, { text: t(jid, "facebook_failed") });
        } finally {
            try {
                if (videoFile && fs.existsSync(videoFile)) {
                    fs.unlinkSync(videoFile);
                }
            } catch (e) {
                console.error("Cleanup error:", e.message);
            }
        }
    }
};
