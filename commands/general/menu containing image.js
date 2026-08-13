const { t } = require("../../lib/lang");
const { commands } = require("../../handler");
const settings = require("../../lib/settings");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = {
    name: "menu",
    category: "general",
    description: "Show bot commands",
    permission: "public",

    execute: async (sock, msg, args = []) => {

        const dictionary = require("../../language/source/dictionary");
        const commandFr = require("../../language/source/command-fr");

        const jid = msg.key.remoteJid;
        const page = (args[0] || "").toLowerCase();
        const config = settings.get("global");

        const { version } = require("../../package.json");

        const botName = config.bot_name || "Whisperer_Bot";
        const prefix = config.prefix || ".";

        const lang =
            config.language === "fr"
                ? "Français 🇫🇷"
                : "English 🇬🇧";

        // =========================
        // UPTIME
        // =========================

        const seconds = Math.floor(
            (Date.now() - (global.START_TIME || Date.now())) / 1000
        );

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const uptime = `${hours}h ${minutes}m ${secs}s`;

        // =========================
        // RAM
        // =========================

        const ram = (
            process.memoryUsage().rss /
            1024 /
            1024
        ).toFixed(1);

        // =========================
        // COMMANDS
        // =========================

        const uniqueCommands = [
            ...new Set(commands.values())
        ];

        const commandCount = uniqueCommands.length;

        // =========================
        // CATEGORIES
        // =========================

        const icons = {
            admin: "👮",
            group: "👥",
            owner: "👑",
            fun: "🎮",
            general: "📖",
            info: "ℹ️",
            tools: "🛠️",
            other: "📦"
        };

        const commandIcons = {
            admin: "🛡️",
            group: "👥",
            owner: "👑",
            fun: "🎲",
            general: "📖",
            info: "ℹ️",
            tools: "🛠️",
            other: "📦"
        };

        const categoryBanners = {
            admin: t("menu_banner_admin"),
            group: t("menu_banner_group"),
            owner: t("menu_banner_owner"),
            fun: t("menu_banner_fun"),
            general: t("menu_banner_general"),
            info: t("menu_banner_info"),
            tools: t("menu_banner_tools"),
            other: t("menu_banner_other")
        };

        const categories = {};

        for (const command of uniqueCommands) {

            const cat = command.category || "other";

            if (!categories[cat]) {
                categories[cat] = [];
            }

            categories[cat].push(command);
        }

        // =========================
        // UNKNOWN PAGE
        // =========================

        if (page && !categories[page]) {

            return sock.sendMessage(jid, {
                text:
`${t("menu_unknown")}

${t("menu_available_pages")}

👮 admin
👥 group
👑 owner
🎮 fun
📖 general
ℹ️ info
🛠 tools

${t("menu_example")}
${prefix}menu admin`
            });
        }

        // =====================================================
        // DEFAULT .MENU → DYNAMIC IMAGE
        // =====================================================

        if (!page) {

            const now = new Date();

            const date = now.toLocaleDateString(
                config.language === "fr" ? "fr-FR" : "en-US",
                {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric"
                }
            );

            const userName =
                msg.pushName ||
                "User";

            const categoryLines = Object.keys(categories)
                .map(cat => {
                    const name =
                        cat.charAt(0).toUpperCase() +
                        cat.slice(1);

                    return `
                        <text x="90" y="${520 + Object.keys(categories).indexOf(cat) * 42}"
                            class="category">
                            ${icons[cat] || "📦"} ${name}
                        </text>

                        <text x="650" y="${520 + Object.keys(categories).indexOf(cat) * 42}"
                            class="categoryCount">
                            ${categories[cat].length}
                        </text>
                    `;
                })
                .join("");

            const categoryHeight =
                Object.keys(categories).length * 42;

            const height = 600 + categoryHeight;

            const svg = `
<svg width="900" height="${height}" xmlns="http://www.w3.org/2000/svg">

    <defs>

        <linearGradient id="bg"
            x1="0%" y1="0%"
            x2="100%" y2="100%">

            <stop offset="0%" stop-color="#07111f"/>
            <stop offset="50%" stop-color="#102a43"/>
            <stop offset="100%" stop-color="#06101c"/>

        </linearGradient>

        <linearGradient id="card"
            x1="0%" y1="0%"
            x2="100%" y2="100%">

            <stop offset="0%" stop-color="#17324d"/>
            <stop offset="100%" stop-color="#0b1d30"/>

        </linearGradient>

    </defs>

    <!-- Background -->

    <rect width="100%" height="100%"
        fill="url(#bg)"
        rx="35"/>

    <!-- Header -->

    <text x="450" y="75"
        text-anchor="middle"
        class="title">

        🤖 ${botName}

    </text>

    <text x="450" y="112"
        text-anchor="middle"
        class="subtitle">

        THE-WHISPERER BOT

    </text>

    <!-- Divider -->

    <line x1="70" y1="140"
        x2="830" y2="140"
        stroke="#3c6e91"
        stroke-width="2"/>

    <!-- Information card -->

    <rect x="60" y="165"
        width="780"
        height="285"
        rx="25"
        fill="url(#card)"
        stroke="#315875"
        stroke-width="2"/>

    <text x="90" y="205"
        class="info">

        👤 User: ${userName}

    </text>

    <text x="90" y="245"
        class="info">

        🌍 Language: ${lang}

    </text>

    <text x="90" y="285"
        class="info">

        ⚡ Prefix: ${prefix}

    </text>

    <text x="90" y="325"
        class="info">

        📦 Version: ${version}

    </text>

    <text x="90" y="365"
        class="info">

        ⏱ Uptime: ${uptime}

    </text>

    <text x="90" y="405"
        class="info">

        💾 RAM: ${ram} MB

    </text>

    <text x="520" y="205"
        class="info">

        📚 Commands: ${commandCount}

    </text>

    <text x="520" y="245"
        class="info">

        📅 Date: ${date}

    </text>

    <text x="520" y="285"
        class="info">

        💻 Node: ${process.version}

    </text>

    <!-- Categories -->

    <text x="450" y="495"
        text-anchor="middle"
        class="section">

        📂 COMMAND CATEGORIES

    </text>

    ${categoryLines}

    <!-- Footer -->

    <text x="450"
        y="${height - 35}"
        text-anchor="middle"
        class="footer">

        ${prefix}menu &lt;category&gt; • ${botName}

    </text>

    <style>

        .title {
            fill: white;
            font-size: 38px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .subtitle {
            fill: #78b7df;
            font-size: 18px;
            font-family: Arial, sans-serif;
            letter-spacing: 3px;
        }

        .info {
            fill: #e8f3fa;
            font-size: 22px;
            font-family: Arial, sans-serif;
        }

        .section {
            fill: #ffffff;
            font-size: 25px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .category {
            fill: #dcecf5;
            font-size: 21px;
            font-family: Arial, sans-serif;
        }

        .categoryCount {
            fill: #75c8ff;
            font-size: 21px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .footer {
            fill: #7197b2;
            font-size: 16px;
            font-family: Arial, sans-serif;
        }

    </style>

</svg>
`;

            try {

                const image = await sharp(
                    Buffer.from(svg)
                )
                .png()
                .toBuffer();

                return await sock.sendMessage(jid, {
                    image,
                    caption:
                        `🤖 *${botName}*\n\n` +
                        `${prefix}menu <category>`
                });

            } catch (error) {

                console.error(
                    "MENU IMAGE ERROR:",
                    error
                );

                return sock.sendMessage(jid, {
                    text: `🤖 *${botName}*\n\n${t("menu_categories")}`
                });
            }
        }

        // =====================================================
        // CATEGORY MENU → EXISTING TEXT MENU
        // =====================================================

        const icon = icons[page] || "📦";
        const cmdIcon = commandIcons[page] || "⚙️";

        const banner =
            categoryBanners[page] ||
            page.toUpperCase();

        let menu =
`
━━━━━━━━━━━━━━━━━━

${icon} *${banner}*

━━━━━━━━━━━━━━━━━━

`;

        for (
            const command of categories[page]
        ) {

            let description =
                config.language === "fr"
                    ? (
                        commandFr[command.name] ||
                        dictionary[command.name] ||
                        command.description
                    )
                    : (
                        dictionary[command.name] ||
                        command.description
                    );

            menu +=
                `${cmdIcon} *${prefix}${command.name}*\n`;

            menu +=
                `${description}\n\n`;

            menu +=
                `━━━━━━━━━━━━━━━━━━\n\n`;
        }

        menu +=
`
💡 ${t("menu_return")}

${prefix}menu
`;

        return await sock.sendMessage(jid, {
            text: menu
        });
    }
};
