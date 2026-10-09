require("dotenv").config({ override: true });

const fs = require("fs");
const path = require("path");
const { t } = require("../../lib/lang");

const ENV_FILE = path.join(process.cwd(), ".env");

const KEYS = {
    NEWS_API_KEY: {
        label: "NewsAPI"
    },
    TMDB_API_KEY: {
        label: "TMDB"
    },
    GROQ_API_KEY: {
        label: "Groq"
    }
};

function readEnv() {
    if (!fs.existsSync(ENV_FILE)) return {};

    const result = {};

    for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) continue;

        const index = trimmed.indexOf("=");

        if (index === -1) continue;

        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();

        result[key] = value;
    }

    return result;
}

function writeEnv(env) {
    const lines = [];

    for (const [key, value] of Object.entries(env)) {
        lines.push(`${key}=${value}`);
    }

    fs.writeFileSync(
        ENV_FILE,
        lines.length ? `${lines.join("\n")}\n` : ""
    );
}

function mask(value, jid) {
    if (!value) return "❌ Not set";

    const text = String(value);

    if (text.length <= 8) {
        return "••••••••";
    }

    return `${text.slice(0, 4)}••••${text.slice(-4)}`;
}

function usage(jid) {
    return sock => sock.sendMessage(jid, {
        text: `
╭━━━〔 🔐 .ENV 〕━━━╮

.env set KEY VALUE
.env remove KEY
.env status
.env guide KEY

Available keys:
• NEWS_API_KEY
• TMDB_API_KEY
• GROQ_API_KEY

Examples:
.env set GROQ_API_KEY YOUR_KEY
.env status
.env guide GROQ_API_KEY

╰━━━━━━━━━━━━━━━━━━━━╯
`.trim()
    });
}

module.exports = {
    name: "env",
    description: "Manage API keys securely",
    category: "owner",
    permission: "owner",
    usage: ".env set/status/remove/guide",
    minArgs: 1,

    execute: async (sock, msg, args = []) => {
        const jid = msg?.key?.remoteJid;

        if (!jid) return;

        const action = args[0]?.toLowerCase();
        const env = readEnv();

        if (!action || !["set", "remove", "status", "guide"].includes(action)) {
            return usage(jid)(sock);
        }

        if (action === "status") {
            const lines = [
                "╭━━━〔 🔐 API STATUS 〕━━━╮",
                "",
                `📰 NewsAPI       ${mask(env.NEWS_API_KEY, jid)}`,
                `🎬 TMDB          ${mask(env.TMDB_API_KEY, jid)}`,
                `🧠 Groq          ${mask(env.GROQ_API_KEY, jid)}`,
                "",
                "╰━━━━━━━━━━━━━━━━━━━━╯"
            ];

            return sock.sendMessage(jid, {
                text: lines.join("\n")
            });
        }

        if (action === "set") {
            const key = args[1]?.toUpperCase();
            const value = args.slice(2).join(" ").trim();

            if (!KEYS[key]) {
                return sock.sendMessage(jid, {
                    text: "❌ Invalid API key.\n\nAvailable: NEWS_API_KEY, TMDB_API_KEY, GROQ_API_KEY"
                });
            }

            if (!value) {
                return sock.sendMessage(jid, {
                    text: `❌ Usage:\n.env set ${key} YOUR_KEY`
                });
            }

            env[key] = value;
            writeEnv(env);

            // Refresh current process environment immediately.
            process.env[key] = value;

            return sock.sendMessage(jid, {
                text: `✅ ${KEYS[key].label} API key saved successfully.`
            });
        }

        if (action === "remove") {
            const key = args[1]?.toUpperCase();

            if (!KEYS[key]) {
                return sock.sendMessage(jid, {
                    text: "❌ Invalid API key.\n\nAvailable: NEWS_API_KEY, TMDB_API_KEY, GROQ_API_KEY"
                });
            }

            delete env[key];
            delete process.env[key];

            writeEnv(env);

            return sock.sendMessage(jid, {
                text: `🗑️ ${KEYS[key].label} API key removed.`
            });
        }

        if (action === "guide") {
            const key = args[1]?.toUpperCase();

            const guides = {
                NEWS_API_KEY: [
                    "📰 NewsAPI",
                    "",
                    "1️⃣ Open the NewsAPI website.",
                    "2️⃣ Create an account.",
                    "3️⃣ Generate your API key.",
                    "4️⃣ Copy the key.",
                    "",
                    ".env set NEWS_API_KEY YOUR_KEY"
                ],

                TMDB_API_KEY: [
                    "🎬 TMDB",
                    "",
                    "1️⃣ Create a TMDB account.",
                    "2️⃣ Open your account API settings.",
                    "3️⃣ Create an API key.",
                    "4️⃣ Copy the API key.",
                    "",
                    ".env set TMDB_API_KEY YOUR_KEY"
                ],

                GROQ_API_KEY: [
                    "🧠 Groq",
                    "",
                    "1️⃣ Create a Groq account.",
                    "2️⃣ Open the API keys section.",
                    "3️⃣ Create a new API key.",
                    "4️⃣ Copy the key.",
                    "",
                    ".env set GROQ_API_KEY YOUR_KEY"
                ]
            };

            if (!guides[key]) {
                return sock.sendMessage(jid, {
                    text: `
Available guides:

.env guide NEWS_API_KEY
.env guide TMDB_API_KEY
.env guide GROQ_API_KEY
`.trim()
                });
            }

            return sock.sendMessage(jid, {
                text: guides[key].join("\n")
            });
        }
    }
};
