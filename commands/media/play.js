const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

module.exports = {
    name: "play",
    description: "Search and download authorized audio",
    category: "media",
    permission: "public",
    usage: ".play <song name>",
    minArgs: 1,

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;
        const query = args.join(" ").trim();

        if (!query) {
            return sock.sendMessage(jid, {
                text: t(jid, "play_missing")
            });
        }

        const mediaDir = path.join(__dirname, "../../media");

        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true });
        }

        const baseName = `play-${Date.now()}`;

        // yt-dlp temporary download
        const downloadTemplate = path.join(
            mediaDir,
            `${baseName}.%(ext)s`
        );

        // Final WhatsApp voice-note file
        const output = path.join(
            mediaDir,
            `${baseName}.ogg`
        );

        let downloadedFile = null;

        try {
            // ==========================================
            // SEARCH MESSAGE
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "play_searching")
            });

            // ==========================================
            // DOWNLOAD AUDIO WITH YT-DLP
            // ==========================================

            await new Promise((resolve, reject) => {
                execFile(
                    "yt-dlp",
                    [
                        `ytsearch1:${query}`,

                        // Extract audio
                        "-x",

                        // Let yt-dlp/FFmpeg produce Opus
                        "--audio-format", "opus",
                        "--audio-quality", "128K",

                        // Only first search result
                        "--no-playlist",

                        // Retry temporary network failures
                        "--retries", "3",
                        "--fragment-retries", "3",

                        // Don't fill the bot log with progress
                        "--no-warnings",

                        // Output
                        "-o", downloadTemplate
                    ],
                    {
                        maxBuffer: 20 * 1024 * 1024
                    },
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(
                                "❌ YT-DLP ERROR:",
                                stderr || error.message
                            );

                            reject(error);
                            return;
                        }

                        console.log("🎵 YT-DLP:", stdout);
                        resolve();
                    }
                );
            });

            // ==========================================
            // FIND THE FILE CREATED BY YT-DLP
            // ==========================================

            const files = fs.readdirSync(mediaDir);

            const downloadedFiles = files.filter(file =>
                file.startsWith(`${baseName}.`) &&
                !file.endsWith(".part") &&
                !file.endsWith(".ytdl")
            );

            if (!downloadedFiles.length) {
                throw new Error(
                    "yt-dlp completed but no audio file was found."
                );
            }

            downloadedFile = path.join(
                mediaDir,
                downloadedFiles[0]
            );

            console.log(
                "🎧 Downloaded audio:",
                downloadedFile
            );

            // ==========================================
            // CONVERT TO WHATSAPP OGG/OPUS
            // ==========================================

            await new Promise((resolve, reject) => {
                execFile(
                    "ffmpeg",
                    [
                        "-y",

                        "-i", downloadedFile,

                        // Audio only
                        "-vn",

                        // WhatsApp voice-note friendly Opus
                        "-c:a", "libopus",
                        "-b:a", "128k",

                        // Mono voice-note style audio
                        "-ac", "1",

                        // Standard Opus sample rate
                        "-ar", "48000",

                        output
                    ],
                    {
                        maxBuffer: 20 * 1024 * 1024
                    },
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(
                                "❌ FFMPEG ERROR:",
                                stderr || error.message
                            );

                            reject(error);
                            return;
                        }

                        console.log(
                            "🔄 FFmpeg conversion completed."
                        );

                        resolve();
                    }
                );
            });

            if (!fs.existsSync(output)) {
                throw new Error(
                    "Final OGG/Opus file was not created."
                );
            }

            // ==========================================
            // SEND STATUS
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "play_sending")
            });

            // ==========================================
            // SEND AS REAL WHATSAPP VOICE NOTE
            // ==========================================

            await sock.sendMessage(jid, {
                audio: {
                    url: output
                },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            });

            // ==========================================
            // SUCCESS MESSAGE
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "play_success")
            });

        } catch (err) {
            console.error("❌ PLAY ERROR:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "play_failed")
            });

        } finally {

            // ==========================================
            // CLEANUP
            // ==========================================

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
                                "❌ Cleanup error:",
                                err.message
                            );
                        }
                    }
                }
            } catch (err) {
                console.error(
                    "❌ Cleanup scan error:",
                    err.message
                );
            }
        }
    }
};
