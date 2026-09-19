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

            const normalizedQuery = normalizeText(requested)
                .replace(/\b(feat|ft|featuring)\b/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (!normalizedTitle || !normalizedQuery) {
                return false;
            }

            const mixTerms = [
                "mix",
                "mega mix",
                "megamiх",
                "compilation",
                "playlist",
                "nonstop",
                "non stop",
                "dj mix",
                "volume",
                "vol",
                "continuous",
                "mixtape",
                "medley",
                "live set"
            ];

            const titleLower = normalizedTitle;

            if (
                mixTerms.some(term =>
                    titleLower.includes(term)
                )
            ) {
                console.log(
                    "🚫 Rejecting likely mix/compilation:",
                    title
                );

                return false;
            }

            const queryTokens = normalizedQuery
                .split(/\s+/)
                .filter(Boolean);

            const titleTokens = new Set(
                getTokens(title)
            );

            if (!queryTokens.length) {
                return false;
            }

            const matched = queryTokens.filter(
                token => titleTokens.has(token)
            ).length;

            // Exact meaningful-word match.
            if (matched === queryTokens.length) {
                return true;
            }

            // Allow one missing word for titles such as:
            // "Giveaway (feat. Zlatan)"
            // when the query contains an artist name.
            if (
                queryTokens.length >= 3 &&
                matched / queryTokens.length >= 0.66
            ) {
                return true;
            }

            return false;
        }

        function isReasonableSongLength(result) {
            const duration = Number(result.duration) || 0;

            // If SoundCloud did not provide duration,
            // don't reject the result on duration alone.
            if (!duration) {
                return true;
            }

            // Normal songs are usually well below this.
            // This prevents long mixes/compilations from
            // being selected as a requested individual song.
            if (duration > 15 * 60) {
                console.log(
                    `🚫 Rejecting long result (${Math.round(duration)}s):`,
                    result.title
                );

                return false;
            }

            return true;
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
            const normalized = searchQuery
                .replace(/\s+/g, " ")
                .trim();

            const words = normalized.split(" ").filter(Boolean);

            const searchQueries = [];

            // Original full query
            searchQueries.push(normalized);

            // Remove common feature words and retry
            const withoutFeatures = normalized
                .replace(/\b(feat|ft|featuring)\b/gi, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (
                withoutFeatures &&
                withoutFeatures !== normalized
            ) {
                searchQueries.push(withoutFeatures);
            }

            // Try artist/title portions separately
            if (words.length >= 3) {
                searchQueries.push(
                    words.slice(0, 2).join(" ")
                );

                searchQueries.push(
                    words.slice(-2).join(" ")
                );
            }

            // Remove duplicate searches
            const uniqueQueries = [
                ...new Set(
                    searchQueries.filter(Boolean)
                )
            ];

            console.log(
                "🔎 SoundCloud search variations:",
                uniqueQueries
            );

            const allResults = [];
            const seenUrls = new Set();

            for (const searchTerm of uniqueQueries) {
                try {
                    console.log(
                        "🔎 Searching SoundCloud:",
                        searchTerm
                    );

                    const result = await ytDlp(
                        `scsearch10:${searchTerm}`,
                        {
                            flatPlaylist: true,
                            dumpSingleJson: true,
                            noWarnings: true,
                            skipDownload: true
                        }
                    );

                    const entries =
                        result &&
                        Array.isArray(result.entries)
                            ? result.entries
                            : [];

                    console.log(
                        `🎯 "${searchTerm}" returned ${entries.length} result(s).`
                    );

                    for (const item of entries) {
                        if (!item) {
                            continue;
                        }

                        const url =
                            item.webpage_url ||
                            item.url ||
                            "";

                        if (!url || seenUrls.has(url)) {
                            continue;
                        }

                        seenUrls.add(url);

                        allResults.push({
                            id: item.id,
                            title: item.title || "",
                            url,
                            duration: Number(item.duration) || 0
                        });
                    }
                } catch (error) {
                    console.error(
                        `⚠️ SoundCloud search failed for "${searchTerm}":`,
                        error.message
                    );
                }
            }

            console.log(
                `🎯 Combined SoundCloud results: ${allResults.length}`
            );

            return allResults;
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
                results
                    .filter(item =>
                        item.url &&
                        matchesRequestedSong(
                            item.title,
                            query
                        ) &&
                        isReasonableSongLength(item)
                    )
                    .sort((a, b) => {
                        const aDuration =
                            Number(a.duration) || 0;

                        const bDuration =
                            Number(b.duration) || 0;

                        // Prefer results with a known,
                        // normal song length.
                        if (!aDuration && bDuration) {
                            return 1;
                        }

                        if (aDuration && !bDuration) {
                            return -1;
                        }

                        return aDuration - bDuration;
                    });

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
