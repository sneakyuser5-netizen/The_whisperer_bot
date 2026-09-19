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
        const downloadedFile = path.join(
            mediaDir,
            `${baseName}.mp3`
        );
        const output = path.join(
            mediaDir,
            `${baseName}.ogg`
        );

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
                    if (
                        [301, 302, 303, 307, 308].includes(
                            response.statusCode
                        )
                    ) {
                        response.resume();

                        const location =
                            response.headers.location;

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

                    if (
                        ![200, 206].includes(
                            response.statusCode
                        )
                    ) {
                        response.resume();

                        reject(
                            new Error(
                                `HTTP ${response.statusCode}`
                            )
                        );

                        return;
                    }

                    const stream =
                        fs.createWriteStream(filePath);

                    response.pipe(stream);

                    stream.on("finish", () => {
                        stream.close(() => {
                            resolve();
                        });
                    });

                    stream.on("error", err => {
                        stream.destroy();
                        reject(err);
                    });

                    response.on("error", err => {
                        stream.destroy();
                        reject(err);
                    });
                });

                request.setTimeout(120000, () => {
                    request.destroy(
                        new Error(
                            "Download timed out"
                        )
                    );
                });

                request.on("error", reject);
            });
        }

        function cleanupFile(filePath) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(
                        "🧹 Deleted:",
                        filePath
                    );
                }
            } catch (error) {
                console.error(
                    "❌ Cleanup error:",
                    error.message
                );
            }
        }

        try {
            await sock.sendMessage(jid, {
                text: t(jid, "play_searching")
            });

            console.log(
                "🔎 Searching YouTube:",
                query
            );

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
            );

            if (!video || !video.url) {
                throw new Error(
                    "Could not find a playable YouTube video."
                );
            }

            console.log(
                "🎵 Selected exact search result:",
                video.title || video.url
            );

            console.log(
                "🔗 YouTube URL:",
                video.url
            );

            console.log(
                "🎯 Requesting audio for this exact video..."
            );

            let result;

            try {
                result = await youtube(video.url);
            } catch (error) {
                throw new Error(
                    `YouTube audio downloader failed: ${error.message}`
                );
            }

            if (!result || !result.status) {
                throw new Error(
                    "YouTube audio downloader failed for the selected video."
                );
            }

            if (
                typeof result.mp3 !== "string" ||
                !result.mp3.trim()
            ) {
                throw new Error(
                    "The selected YouTube video has no downloadable MP3 URL."
                );
            }

            console.log(
                "🔗 MP3 URL received for selected video."
            );

            console.log(
                "⬇️ Downloading audio..."
            );

            await downloadFile(
                result.mp3,
                downloadedFile
            );

            if (
                !fs.existsSync(downloadedFile)
            ) {
                throw new Error(
                    "Downloaded audio file was not created."
                );
            }

            const downloadedSize =
                fs.statSync(
                    downloadedFile
                ).size;

            if (downloadedSize === 0) {
                throw new Error(
                    "Downloaded audio file is empty."
                );
            }

            console.log(
                "🎧 Downloaded:",
                downloadedFile,
                downloadedSize,
                "bytes"
            );

            console.log(
                "🔄 Converting audio to Opus..."
            );

            await new Promise(
                (resolve, reject) => {
                    execFile(
                        "ffmpeg",
                        [
                            "-y",
                            "-i",
                            downloadedFile,
                            "-vn",
                            "-c:a",
                            "libopus",
                            "-b:a",
                            "128k",
                            "-ac",
                            "1",
                            "-ar",
                            "48000",
                            output
                        ],
                        {
                            maxBuffer:
                                20 *
                                1024 *
                                1024
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
                }
            );

            if (
                !fs.existsSync(output)
            ) {
                throw new Error(
                    "Final OGG/Opus file was not created."
                );
            }

            const outputSize =
                fs.statSync(output).size;

            if (outputSize === 0) {
                throw new Error(
                    "Final OGG/Opus file is empty."
                );
            }

            console.log(
                "🎧 Final audio:",
                output,
                outputSize,
                "bytes"
            );

            await sock.sendMessage(jid, {
                text: t(jid, "play_sending")
            });

            await sock.sendMessage(jid, {
                audio: {
                    url: output
                },
                mimetype:
                    "audio/ogg; codecs=opus",
                ptt: true
            });

            await sock.sendMessage(jid, {
                text: t(jid, "play_success")
            });

            console.log(
                "✅ PLAY completed successfully."
            );
        } catch (error) {
            console.error(
                "❌ PLAY ERROR:",
                error
            );

            await sock.sendMessage(jid, {
                text: t(jid, "play_failed")
            });
        } finally {
            cleanupFile(downloadedFile);
            cleanupFile(output);

            console.log(
                "🧹 PLAY temporary files cleaned."
            );
        }
    }
};
