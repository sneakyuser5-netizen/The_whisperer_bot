const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { t } = require("../../lib/lang");

const SEARCH_COOLDOWN = 30000;
const DOWNLOAD_COOLDOWN = 60000;

const searches = new Map();
const downloads = new Map();
const selections = new Map();

function clean(text) {
    return String(text || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

async function fetchPage(url) {
    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36",
            "Accept": "text/html,application/xhtml+xml"
        },
        redirect: "follow"
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return {
        url: response.url,
        text: await response.text()
    };
}

function findApp(searchHtml, searchUrl) {
    const match = searchHtml.match(
        /href=["'](\/[^"'<>]+\/com\.[a-zA-Z0-9._-]+\/?)["']/i
    );

    if (!match) {
        return null;
    }

    return new URL(match[1], searchUrl).href;
}

function findVersions(html, appUrl) {
    const versions = [];
    const seen = new Set();

    const regex =
        /href=["']([^"']*\/download\/(?:phone|tablet|tv)-([0-9]+(?:\.[0-9]+)+)-apk)["']/gi;

    let match;

    while ((match = regex.exec(html)) !== null) {
        const url = new URL(match[1], appUrl).href;
        const version = match[2];

        if (seen.has(version)) continue;

        seen.add(version);

        versions.push({
            version,
            url
        });

        if (versions.length >= 10) break;
    }

    return versions;
}

function findDirectDownload(html) {
    const match = html.match(/\/r2\?u=([^"'<>]+)/i);

    if (!match) {
        return null;
    }

    try {
        const decoded = decodeURIComponent(match[1]);

        if (!/^https?:\/\//i.test(decoded)) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

function validArchive(buffer) {
    return (
        buffer.length > 10000 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b
    );
}

function formatSize(bytes) {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function tr(jid, key, replacements = {}) {
    let text = t(jid, key);

    for (const [name, value] of Object.entries(replacements)) {
        text = text.replace(
            new RegExp(`\\{${name}\\}`, "g"),
            String(value)
        );
    }

    return text;
}

module.exports = {
    name: "apk",
    aliases: ["app"],
    category: "tools",
    permission: "public",
    description: "Search and download Android app versions",
    usage: ".apk <app name> | .apk <number>",

    execute: async (sock, msg, args) => {
        if (msg.key?.fromMe) return;

        const jid = msg.key?.remoteJid;

        if (!jid) return;

        const input = args.join(" ").trim();

        if (!input) {
            await sock.sendMessage(jid, {
                text: tr(jid, "tools.apk_help")
            });
            return;
        }

        const now = Date.now();

        /*
         * VERSION SELECTION
         */
        if (/^\d+$/.test(input)) {
            const index = Number(input) - 1;
            const selection = selections.get(jid);

            if (!selection || !selection.versions[index]) {
                await sock.sendMessage(jid, {
                    text: tr(jid, "tools.apk_no_selection")
                });
                return;
            }

            const lastDownload = downloads.get(jid) || 0;

            if (now - lastDownload < DOWNLOAD_COOLDOWN) {
                const remaining = Math.ceil(
                    (DOWNLOAD_COOLDOWN - (now - lastDownload)) / 1000
                );

                await sock.sendMessage(jid, {
                    text: tr(jid, "tools.apk_download_wait", {
                        seconds: remaining
                    })
                });

                return;
            }

            downloads.set(jid, now);

            const selected = selection.versions[index];

            await sock.sendMessage(jid, {
                text: tr(jid, "tools.apk_preparing", {
                    name: selection.name,
                    version: selected.version
                })
            });

            let tempFile = null;

            try {
                const page = await fetchPage(selected.url);

                const directUrl = findDirectDownload(page.text);

                if (!directUrl) {
                    throw new Error("Direct XAPK URL not found");
                }

                const response = await fetch(directUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Accept": "*/*"
                    },
                    redirect: "follow"
                });

                if (!response.ok) {
                    throw new Error(`Download HTTP ${response.status}`);
                }

                const buffer = Buffer.from(
                    await response.arrayBuffer()
                );

                if (!validArchive(buffer)) {
                    throw new Error(
                        "Downloaded file is not a valid APK/XAPK archive"
                    );
                }

                tempFile = path.join(
                    os.tmpdir(),
                    `whisperbot-${crypto.randomBytes(8).toString("hex")}.xapk`
                );

                fs.writeFileSync(tempFile, buffer);

                await sock.sendMessage(jid, {
                    document: {
                        url: tempFile
                    },
                    mimetype: "application/x-xapk",
                    fileName:
                        `${selection.name.replace(/[^a-z0-9._-]/gi, "_")}_` +
                        `${selected.version}.xapk`,
                    caption: tr(jid, "tools.apk_caption", {
                        name: selection.name,
                        version: selected.version,
                        size: formatSize(buffer.length)
                    })
                });

            } catch (error) {
                await sock.sendMessage(jid, {
                    text: tr(jid, "tools.apk_download_failed", {
                        name: selection.name,
                        version: selected.version,
                        reason: error.message
                    })
                });

            } finally {
                if (tempFile) {
                    try {
                        fs.unlinkSync(tempFile);
                    } catch {}
                }
            }

            return;
        }

        /*
         * SEARCH
         */
        const lastSearch = searches.get(jid) || 0;

        if (now - lastSearch < SEARCH_COOLDOWN) {
            const remaining = Math.ceil(
                (SEARCH_COOLDOWN - (now - lastSearch)) / 1000
            );

            await sock.sendMessage(jid, {
                text: tr(jid, "tools.apk_search_wait", {
                    seconds: remaining
                })
            });

            return;
        }

        searches.set(jid, now);

        await sock.sendMessage(jid, {
            text: tr(jid, "tools.apk_searching", {
                query: input
            })
        });

        try {
            const searchUrl =
                `https://apkcombo.com/search/${encodeURIComponent(input)}/`;

            const search = await fetchPage(searchUrl);

            const appUrl = findApp(
                search.text,
                searchUrl
            );

            if (!appUrl) {
                throw new Error("App link not found");
            }

            const appPage = await fetchPage(appUrl);

            const versions = findVersions(
                appPage.text,
                appUrl
            );

            if (!versions.length) {
                throw new Error("No versions found");
            }

            let name = input;

            const title = appPage.text.match(
                /<title[^>]*>([\s\S]*?)<\/title>/i
            );

            if (title) {
                name =
                    clean(title[1])
                        .replace(/\s*[-|].*$/, "")
                        .trim() || input;
            }

            selections.set(jid, {
                name,
                appUrl,
                versions,
                createdAt: now
            });

            const lines = [
                tr(jid, "tools.apk_title", {
                    name
                }),
                "",
                tr(jid, "tools.apk_available_versions"),
                ""
            ];

            versions.forEach((item, index) => {
                lines.push(
                    `${index + 1}. ${item.version}`
                );
            });

            lines.push(
                "",
                tr(jid, "tools.apk_reply_with"),
                ".apk 1"
            );

            await sock.sendMessage(jid, {
                text: lines.join("\n")
            });

        } catch {
            await sock.sendMessage(jid, {
                text: tr(jid, "tools.apk_not_found", {
                    query: input
                })
            });
        }
    }
};
