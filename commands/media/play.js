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

        function normalizeText(text = "") {
            return text
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, " ")
                .trim();
        }

        function getTokens(text = "") {
            return normalizeText(text)
                .split(/\s+/)
                .filter(Boolean);
        }

        function matchesRequestedSong(title, requested) {
            const normalizedTitle = normalizeText(title);
            const normalizedQuery = normalizeText(requested);

            if (!normalizedTitle || !normalizedQuery) {
                return false;
            }

            // Exact phrase match.
            if (normalizedTitle.includes(normalizedQuery)) {
                return true;
            }

            const queryTokens = getTokens(requested);
            const titleTokens = new Set(getTokens(title));

            if (!queryTokens.length) {
                return false;
            }

            // Every requested word must appear in the title.
            const allTokensPresent = queryTokens.every(
                token => titleTokens.has(token)
            );

            if (allTokensPresent) {
                return true;
            }

            // Allow a strong partial match for longer searches,
            // but never accept an artist-only unrelated song.
            if (queryTokens.length >= 2) {
                const matched = queryTokens.filter(
                    token => titleTokens.has(token)
                ).length;

                const ratio =
                    matched / queryTokens.length;

                return ratio >= 0.8;
            }

            return false;
        }

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

            /*
             * IMPORTANT:
             * Only use videos whose titles match the
             * requested song.
             *
             * This prevents:
             *
             * ".play Pana"
             *
             * from silently becoming another Tekno song.
             */
            const matchingVideos = results.filter(
                item =>
                    item &&
                    item.type === "video" &&
                    item.url &&
                    matchesRequestedSong(
                        item.title || "",
                        query
                    )
            );

            console.log(
                `🎯 Found ${matchingVideos.length} matching result(s) for:`,
                query
            );

            if (!matchingVideos.length) {
                throw new Error(
                    "No YouTube result matched the requested song."
                );
            }

            let selectedVideo = null;
            let selectedMp3 = null;

            /*
             * Try matching uploads one by one.
             *
             * We NEVER try an unrelated artist song.
             */
            for (
                let i = 0;
                i < matchingVideos.length;
                i++
            ) {
                const video = matchingVideos[i];

                console.log(
                    `🎵 Trying matching result ${i + 1}/${matchingVideos.length}:`,
                    video.title
                );

                console.log(
                    "🔗 YouTube URL:",
                    video.url
                );

                let result;

                try {
                    result = await youtube(video.url);
                } catch (error) {
                    console.error(
                        "⚠️ Downloader error:",
                        error.message
                    );

                    continue;
                }

                if (
                    !result ||
                    !result.status
                ) {
                    console.log(
                        "⚠️ Downloader did not return a valid result."
                    );

                    continue;
                }

                if (
                    typeof result.mp3 !== "string" ||
                    !result.mp3.trim()
                ) {
                    console.log(
                        "⚠️ No MP3 URL for this matching result."
                    );

                    continue;
                }

                console.log(
                    "🔗 MP3 URL received."
                );

                try {
                    cleanupFile(downloadedFile);

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
                            "⚠️ Download file was not created."
                        );

                        continue;
                    }

                    const size =
                        fs.statSync(
                            downloadedFile
                        ).size;

                    if (size === 0) {
                        console.log(
                            "⚠️ Downloaded file is empty."
                        );

                        cleanupFile(
                            downloadedFile
                        );

                        continue;
                    }

                    console.log(
                        "🎧 Downloaded:",
                        size,
                        "bytes"
                    );

                    selectedVideo = video;
                    selectedMp3 = result.mp3;

                    break;
                } catch (error) {
                    console.error(
                        "⚠️ Download failed for this matching result:",
                        error.message
                    );

                    cleanupFile(
                        downloadedFile
                    );
                }
            }

            if (
                !selectedVideo ||
                !selectedMp3
            ) {
                throw new Error(
                    "No downloadable version of the requested song was found."
                );
            }

            console.log(
                "✅ Selected matching downloadable song:",
                selectedVideo.title
            );

            console.log(
                "🔗 Selected URL:",
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
