const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function extractFacebookUrl(msg, args = []) {
    // Check command arguments first
    const text = args.join(" ").trim();

    const urlFromArgs = text.match(
        /https?:\/\/(?:www\.|m\.|web\.)?facebook\.com\/\S+/i
    );

    if (urlFromArgs) {
        return urlFromArgs[0].replace(/[)\]}>.,]+$/, "");
    }

    // Check replied message
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
        /https?:\/\/(?:www\.|m\.|web\.)?facebook\.com\/\S+/i
    );

    if (urlFromReply) {
        return urlFromReply[0].replace(/[)\]}>.,]+$/, "");
    }

    return null;
}

module.exports = {
    name: "facebook",
    description: "Download a Facebook video",
    category: "media",
    permission: "public",
    usage: ".facebook <Facebook URL> or reply to a Facebook video URL",
    minArgs: 0,

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;

        const url = extractFacebookUrl(msg, args);

        if (!url) {
            return sock.sendMessage(jid, {
                text: t(jid, "facebook_missing")
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

        const baseName = `facebook-${Date.now()}`;

        const outputTemplate = path.join(
            mediaDir,
            `${baseName}.%(ext)s`
        );

        try {
            await sock.sendMessage(jid, {
                text: t(jid, "facebook_downloading")
            });

            await new Promise((resolve, reject) => {
                execFile(
                    "yt-dlp",
                    [
                        url,

                        "--no-playlist",

                        "--retries",
                        "3",

                        "--fragment-retries",
                        "3",

                        "--no-warnings",

                        "-o",
                        outputTemplate
                    ],
                    {
                        maxBuffer: 20 * 1024 * 1024
                    },
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(
                                "❌ FACEBOOK YT-DLP ERROR:",
                                stderr || error.message
                            );

                            reject(error);
                            return;
                        }

                        console.log(
                            "📘 FACEBOOK YT-DLP:",
                            stdout
                        );

                        resolve();
                    }
                );
            });

            const files = fs.readdirSync(mediaDir);

            const downloadedFiles = files.filter(file =>
                file.startsWith(`${baseName}.`) &&
                !file.endsWith(".part") &&
                !file.endsWith(".ytdl")
            );

            if (!downloadedFiles.length) {
                throw new Error(
                    "yt-dlp completed but no Facebook video was found."
                );
            }

            const videoFile = path.join(
                mediaDir,
                downloadedFiles[0]
            );

            console.log(
                "🎬 Facebook video:",
                videoFile
            );

            await sock.sendMessage(jid, {
                video: {
                    url: videoFile
                },
                caption: t(jid, "facebook_success")
            });

        } catch (err) {
            console.error(
                "❌ FACEBOOK ERROR:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "facebook_failed")
            });

        } finally {

            try {
                const files = fs.readdirSync(mediaDir);

                for (const file of files) {
                    if (file.startsWith(`${baseName}.`)) {

                        const fullPath = path.join(
                            mediaDir,
                            file
                        );

                        try {
                            fs.unlinkSync(fullPath);

                            console.log(
                                "🧹 Deleted:",
                                fullPath
                            );

                        } catch (err) {
                            console.error(
                                "❌ Facebook cleanup error:",
                                err.message
                            );
                        }
                    }
                }

            } catch (err) {
                console.error(
                    "❌ Facebook cleanup scan error:",
                    err.message
                );
            }
        }
    }
};
