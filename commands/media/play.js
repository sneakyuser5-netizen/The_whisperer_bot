const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const ytDlp = require("youtube-dl-exec");
const { t } = require("../../lib/lang");

module.exports = {
    name: "play",
    description: "Search and download audio from SoundCloud",
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

            if (normalizedTitle.includes(normalizedQuery)) {
                return true;
            }

            const queryTokens = getTokens(requested);
            const titleTokens = new Set(getTokens(title));

            if (!queryTokens.length) {
                return false;
            }

            const allTokensPresent = queryTokens.every(
                token => titleTokens.has(token)
            );

            if (allTokensPresent) {
                return true;
            }

            if (queryTokens.length >= 2) {
                const matched = queryTokens.filter(
                    token => titleTokens.has(token)
                ).length;

                return (
                    matched / queryTokens.length >= 0.8
                );
            }

            return false;
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

        async function searchSoundCloud(searchQuery) {
            console.log(
                "🔎 yt-dlp SoundCloud search:",
                searchQuery
            );

            const result = await ytDlp(
                `scsearch10:${searchQuery}`,
                {
                    flatPlaylist: true,
                    dumpSingleJson: true,
                    noWarnings: true,
                    skipDownload: true
                }
            );

            if (!result) {
                return [];
            }

            const entries =
                Array.isArray(result.entries)
                    ? result.entries
                    : [];

            return entries
                .filter(Boolean)
                .map(item => ({
                    id: item.id,
                    title: item.title || "",
                    url:
                        item.webpage_url ||
                        item.url ||
                        ""
                }));
        }

        async function downloadSoundCloud(
            url,
            filePath
        ) {
            console.log(
                "⬇️ Downloading with bundled yt-dlp:",
                url
            );

            await ytDlp(
                url,
                {
                    noPlaylist: true,
                    extractAudio: true,
                    audioFormat: "mp3",
                    output: filePath,
                    noWarnings: true
                }
            );
        }

        try {
            await sock.sendMessage(jid, {
                text: t(jid, "play_searching")
            });

            console.log(
                "🔎 Searching SoundCloud:",
                query
            );

            const results =
                await searchSoundCloud(query);

            console.log(
                `🎯 SoundCloud returned ${results.length} result(s).`
            );

            if (!results.length) {
                throw new Error(
                    "No SoundCloud results found."
                );
            }

            const matchingResults =
                results.filter(item =>
                    item.url &&
                    matchesRequestedSong(
                        item.title,
                        query
                    )
                );

            console.log(
                `🎵 Found ${matchingResults.length} matching result(s) for:`,
                query
            );

            if (!matchingResults.length) {
                throw new Error(
                    "No SoundCloud result matched the requested song."
                );
            }

            let selectedResult = null;

            for (
                let i = 0;
                i < matchingResults.length;
                i++
            ) {
                const result =
                    matchingResults[i];

                console.log(
                    `🎵 Trying result ${i + 1}/${matchingResults.length}:`,
                    result.title
                );

                console.log(
                    "🔗 SoundCloud URL:",
                    result.url
                );

                cleanupFile(
                    downloadedFile
                );

                try {
                    await downloadSoundCloud(
                        result.url,
                        downloadedFile
                    );

                    if (
                        !fs.existsSync(
                            downloadedFile
                        )
                    ) {
                        console.log(
                            "⚠️ yt-dlp did not create the MP3."
                        );

                        continue;
                    }

                    const size =
                        fs.statSync(
                            downloadedFile
                        ).size;

                    if (size === 0) {
                        console.log(
                            "⚠️ Downloaded MP3 is empty."
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

                    selectedResult =
                        result;

                    break;
                } catch (error) {
                    console.error(
                        "⚠️ SoundCloud download failed:",
                        error.message
                    );

                    cleanupFile(
                        downloadedFile
                    );
                }
            }

            if (!selectedResult) {
                throw new Error(
                    "No downloadable version of the requested song was found."
                );
            }

            console.log(
                "✅ Selected song:",
                selectedResult.title
            );

            console.log(
                "🔗 Selected URL:",
                selectedResult.url
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
                fs.statSync(
                    output
                ).size;

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

            try {
                await sock.sendMessage(jid, {
                    text: t(jid, "play_failed")
                });
            } catch (sendError) {
                console.error(
                    "❌ Failed to send error message:",
                    sendError.message
                );
            }
        } finally {
            cleanupFile(
                downloadedFile
            );

            cleanupFile(
                output
            );

            console.log(
                "🧹 PLAY temporary files cleaned."
            );
        }
    }
};
