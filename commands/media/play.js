const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { execFile } = require("child_process");
const { yts, youtube } = require("btch-downloader");

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
        const downloadedFile = path.join(mediaDir, `${baseName}.mp3`);
        const output = path.join(mediaDir, `${baseName}.ogg`);

        // ==========================================
        // DOWNLOAD FILE WITH REDIRECT SUPPORT
        // ==========================================

        function downloadFile(url, filePath, redirects = 0) {
            return new Promise((resolve, reject) => {
                if (redirects > 10) {
                    reject(new Error("Too many redirects"));
                    return;
                }

                const client = url.startsWith("https://")
                    ? https
                    : http;

                const request = client.get(url, response => {
                    // Follow redirects
                    if (
                        [301, 302, 303, 307, 308].includes(
                            response.statusCode
                        )
                    ) {
                        response.resume();

                        const location = response.headers.location;

                        if (!location) {
                            reject(
                                new Error(
                                    `Redirect without location: HTTP ${response.statusCode}`
                                )
                            );
                            return;
                        }

                        downloadFile(
                            location,
                            filePath,
                            redirects + 1
                        )
                            .then(resolve)
                            .catch(reject);

                        return;
                    }

                    // 200 = normal response
                    // 206 = partial content, valid for media/CDN downloads
                    if (![200, 206].includes(response.statusCode)) {
                        response.resume();

                        reject(
                            new Error(
                                `HTTP ${response.statusCode}`
                            )
                        );

                        return;
                    }

                    const stream = fs.createWriteStream(filePath);

                    response.pipe(stream);

                    stream.on("finish", () => {
                        stream.close(resolve);
                    });

                    stream.on("error", err => {
                        stream.close();
                        reject(err);
                    });
                });

                request.setTimeout(120000, () => {
                    request.destroy(
                        new Error("Download timed out")
                    );
                });

                request.on("error", reject);
            });
        }

        try {
            // ==========================================
            // SEARCH MESSAGE
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "play_searching")
            });

            // ==========================================
            // SEARCH YOUTUBE
            // ==========================================

            console.log("🔎 Searching YouTube:", query);

            const search = await yts(query);

            if (!search || !search.status) {
                throw new Error(
                    "YouTube search failed."
                );
            }

            const results =
                search.result?.videos ||
                search.result?.all ||
                [];

            if (!results.length) {
                throw new Error(
                    "No YouTube results found."
                );
            }

            const video = results.find(
                item =>
                    item &&
                    item.type === "video" &&
                    item.url
            ) || results[0];

            if (!video || !video.url) {
                throw new Error(
                    "Could not find a playable YouTube video."
                );
            }

            console.log(
                "🎵 Selected:",
                video.title || video.url
            );

            console.log(
                "🔗 YouTube URL:",
                video.url
            );

            // ==========================================
            // GET AUDIO DOWNLOAD URL
            // ==========================================

            const result = await youtube(video.url);

            if (!result || !result.status) {
                throw new Error(
                    "YouTube audio downloader failed."
                );
            }

            const audioUrl = result.mp3;

            if (!audioUrl) {
                throw new Error(
                    "YouTube downloader did not return an MP3 URL."
                );
            }

            console.log(
                "⬇️ Downloading audio..."
            );

            // ==========================================
            // DOWNLOAD MP3
            // ==========================================

            await downloadFile(
                audioUrl,
                downloadedFile
            );

            if (
                !fs.existsSync(downloadedFile) ||
                fs.statSync(downloadedFile).size === 0
            ) {
                throw new Error(
                    "Downloaded audio file is empty."
                );
            }

            console.log(
                "🎧 Downloaded:",
                downloadedFile,
                fs.statSync(downloadedFile).size,
                "bytes"
            );

            // ==========================================
            // CONVERT TO WHATSAPP OGG/OPUS
            // ==========================================

            await new Promise((resolve, reject) => {
                execFile(
                    "ffmpeg",
                    [
                        "-y",

                        "-i",
                        downloadedFile,

                        // Audio only
                        "-vn",

                        // WhatsApp voice-note friendly Opus
                        "-c:a",
                        "libopus",

                        "-b:a",
                        "128k",

                        // Mono
                        "-ac",
                        "1",

                        // Standard Opus sample rate
                        "-ar",
                        "48000",

                        output
                    ],
                    {
                        maxBuffer:
                            20 * 1024 * 1024
                    },
                    (
                        error,
                        stdout,
                        stderr
                    ) => {
                        if (error) {
                            console.error(
                                "❌ FFMPEG ERROR:",
                                stderr ||
                                    error.message
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

            if (
                !fs.existsSync(output) ||
                fs.statSync(output).size === 0
            ) {
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
                mimetype:
                    "audio/ogg; codecs=opus",
                ptt: true
            });

            // ==========================================
            // SUCCESS MESSAGE
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "play_success")
            });

            console.log(
                "✅ PLAY completed successfully."
            );

        } catch (err) {
            console.error(
                "❌ PLAY ERROR:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "play_failed")
            });

        } finally {
            // ==========================================
            // CLEANUP
            // ==========================================

            for (const file of [
                downloadedFile,
                output
            ]) {
                try {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);

                        console.log(
                            "🧹 Deleted:",
                            file
                        );
                    }
                } catch (err) {
                    console.error(
                        "❌ Cleanup error:",
                        err.message
                    );
                }
            }
        }
    }
};
