const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { download } = require("@silent-tech-offc/ttdl");

function extractTikTokUrl(msg, args = []) {
    const text = args.join(" ").trim();

    const urlFromArgs = text.match(
        /https?:\/\/(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/\S+/i
    );

    if (urlFromArgs) {
        return urlFromArgs[0].replace(/[)\]}>.,]+$/, "");
    }

    const context =
        msg.message?.extendedTextMessage?.contextInfo;

    const quoted =
        context?.quotedMessage;

    if (!quoted) {
        return null;
    }

    const quotedText =
        quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        quoted.videoMessage?.caption ||
        "";

    const urlFromReply = quotedText.match(
        /https?:\/\/(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/\S+/i
    );

    if (urlFromReply) {
        return urlFromReply[0].replace(/[)\]}>.,]+$/, "");
    }

    return null;
}

function downloadFile(url, outputPath, redirects = 0) {
    return new Promise((resolve, reject) => {
        if (redirects > 10) {
            reject(new Error("Too many redirects."));
            return;
        }

        const client = url.startsWith("https://")
            ? https
            : http;

        const request = client.get(url, response => {
            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                response.resume();

                const nextUrl = new URL(
                    response.headers.location,
                    url
                ).toString();

                downloadFile(
                    nextUrl,
                    outputPath,
                    redirects + 1
                )
                    .then(resolve)
                    .catch(reject);

                return;
            }

            if (response.statusCode !== 200) {
                response.resume();

                reject(
                    new Error(
                        `Download failed with HTTP ${response.statusCode}`
                    )
                );

                return;
            }

            const file = fs.createWriteStream(outputPath);

            response.pipe(file);

            file.on("finish", () => {
                file.close(resolve);
            });

            file.on("error", err => {
                file.destroy();

                try {
                    fs.unlinkSync(outputPath);
                } catch {}

                reject(err);
            });
        });

        request.setTimeout(60000, () => {
            request.destroy(
                new Error("TikTok download timed out.")
            );
        });

        request.on("error", reject);
    });
}

module.exports = {
    name: "tiktok",
    description: "Download a TikTok video",
    category: "media",
    permission: "public",
    usage: ".tiktok <TikTok URL> or reply to a TikTok URL",
    minArgs: 0,

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;

        const url = extractTikTokUrl(msg, args);

        if (!url) {
            return sock.sendMessage(jid, {
                text: t(jid, "tiktok_missing")
            });
        }

        const mediaDir = path.join(
            __dirname,
            "../../media"
        );

        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, {
                recursive: true
            });
        }

        const baseName = `tiktok-${Date.now()}`;
        const videoFile = path.join(
            mediaDir,
            `${baseName}.mp4`
        );

        try {
            await sock.sendMessage(jid, {
                text: t(jid, "tiktok_downloading")
            });

            console.log("🔎 TikTok URL:", url);

            const result = await download(url);

            const videoUrl =
                result.videoNoWatermark ||
                result.video;

            if (!videoUrl) {
                throw new Error(
                    "TikTok downloader returned no video URL."
                );
            }

            console.log(
                "🎬 TikTok video URL received."
            );

            await downloadFile(
                videoUrl,
                videoFile
            );

            if (
                !fs.existsSync(videoFile) ||
                fs.statSync(videoFile).size === 0
            ) {
                throw new Error(
                    "TikTok video download produced an empty file."
                );
            }

            console.log(
                "📦 TikTok video saved:",
                videoFile,
                `${fs.statSync(videoFile).size} bytes`
            );

            await sock.sendMessage(jid, {
                video: {
                    url: videoFile
                },
                caption: t(jid, "tiktok_success")
            });

        } catch (err) {
            console.error(
                "❌ TIKTOK ERROR:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "tiktok_failed")
            });

        } finally {
            try {
                if (fs.existsSync(videoFile)) {
                    fs.unlinkSync(videoFile);

                    console.log(
                        "🧹 Deleted:",
                        videoFile
                    );
                }
            } catch (err) {
                console.error(
                    "❌ TikTok cleanup error:",
                    err.message
                );
            }
        }
    }
};
