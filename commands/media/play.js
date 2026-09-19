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
                        stream.close();
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

        function removeFile(filePath) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error(
                    "❌ File cleanup error:",
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

            const candidates = results
                .filter(
                    item =>
                        item &&
                        item.type === "video" &&
                        item.url
                )
                .slice(0, 10);

            if (!candidates.length) {
                throw new Error(
                    "No playable YouTube videos found."
                );
            }

            console.log(
                `🔍 Found ${results.length} YouTube results.`
            );

            console.log(
                `🎯 Will try up to ${candidates.length} video results.`
            );

            let selectedVideo = null;
            let audioUrl = null;
            let downloaded = false;

            for (
                let i = 0;
                i < candidates.length;
                i++
            ) {
                const video = candidates[i];

                console.log(
                    `\n🎵 Trying result ${i + 1}/${candidates.length}:`,
                    video.title || video.url
                );

                let result;

                try {
                    result = await youtube(video.url);
                } catch (error) {
                    console.log(
                        "⚠️ Downloader error:",
                        error.message
                    );

                    continue;
                }

                if (!result || !result.status) {
                    console.log(
                        "⚠️ Downloader returned failure. Skipping..."
                    );

                    continue;
                }

                if (
                    typeof result.mp3 !== "string" ||
                    !result.mp3.trim()
                ) {
                    console.log(
                        "⚠️ No MP3 URL returned. Skipping..."
                    );

                    continue;
                }

                console.log(
                    "🔗 MP3 URL received."
                );

                removeFile(downloadedFile);

                try {
                    console.log(
                        "⬇️ Downloading audio..."
                    );

                    await downloadFile(
                        result.mp3,
                        downloadedFile
                    );

                    if (
                        !fs.existsSync(
                            downloadedFile
                        )
                    ) {
                        console.log(
                            "⚠️ Download file was not created. Trying next result..."
                        );

                        continue;
                    }

                    const size =
                        fs.statSync(
                            downloadedFile
                        ).size;

                    if (size === 0) {
                        console.log(
                            "⚠️ Downloaded file is empty. Trying next result..."
                        );

                        removeFile(
                            downloadedFile
                        );

                        continue;
                    }

                    console.log(
                        "🎧 Downloaded:",
                        downloadedFile,
                        size,
                        "bytes"
                    );

                    selectedVideo = video;
                    audioUrl = result.mp3;
                    downloaded = true;

                    break;
                } catch (error) {
                    console.log(
                        "⚠️ Audio download failed:",
                        error.message
                    );

                    removeFile(
                        downloadedFile
                    );
                }
            }

            if (
                !downloaded ||
                !selectedVideo ||
                !audioUrl
            ) {
                throw new Error(
                    "No downloadable audio was found among the available YouTube results."
                );
            }

            console.log(
                "\n✅ Selected:",
                selectedVideo.title ||
                    selectedVideo.url
            );

            console.log(
                "🔗 YouTube URL:",
                selectedVideo.url
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
                !fs.existsSync(output) ||
                fs.statSync(output).size === 0
            ) {
                throw new Error(
                    "Final OGG/Opus file was not created."
                );
            }

            console.log(
                "🎧 Final audio:",
                output,
                fs.statSync(output).size,
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
        } catch (err) {
            console.error(
                "❌ PLAY ERROR:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "play_failed")
            });
        } finally {
            removeFile(downloadedFile);
            removeFile(output);

            console.log(
                "🧹 PLAY temporary files cleaned."
            );
        }
    }
};
