const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function extractTikTokUrl(msg, args = []) {
    // 1. Check command arguments
    const text = args.join(" ").trim();

    const urlFromArgs = text.match(
        /https?:\/\/(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/\S+/i
    );

    if (urlFromArgs) {
        return urlFromArgs[0].replace(/[)\]}>.,]+$/, "");
    }

    // 2. Check quoted/replied message
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

        const outputTemplate = path.join(
            mediaDir,
            `${baseName}.%(ext)s`
        );

        try {
            await sock.sendMessage(jid, {
                text: t(jid, "tiktok_downloading")
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
                                "❌ TIKTOK YT-DLP ERROR:",
                                stderr || error.message
                            );

                            reject(error);
                            return;
                        }

                        console.log(
                            "🎵 TIKTOK YT-DLP:",
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
                    "yt-dlp completed but no TikTok video was found."
                );
            }

            const videoFile = path.join(
                mediaDir,
                downloadedFiles[0]
            );

            console.log(
                "🎬 TikTok video:",
                videoFile
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
                                "❌ TikTok cleanup error:",
                                err.message
                            );
                        }
                    }
                }

            } catch (err) {
                console.error(
                    "❌ TikTok cleanup scan error:",
                    err.message
                );
            }
        }
    }
};
