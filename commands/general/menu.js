module.exports = {
    name: "menu",
    category: "general",
    description: "Show bot commands",
    permission: "public",

    execute: async (sock, msg, args = []) => {

        const { t } = require("../../lib/lang");
        const { commands } = require("../../handler");
        const settings = require("../../lib/settings");

        const jid = msg.key.remoteJid;
        const page = (args[0] || "").toLowerCase();

        const config = settings.get("global");

        const lang =
            config.language === "fr"
                ? "Français 🇫🇷"
                : "English 🇬🇧";

        const version = "1.0.0";

        const seconds = Math.floor(
            (Date.now() - (global.START_TIME || Date.now())) / 1000
        );

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const uptime = `${hours}h ${minutes}m ${secs}s`;

        const ram = (
            process.memoryUsage().rss /
            1024 /
            1024
        ).toFixed(1);

        const icons = {
            admin: "👮",
            group: "👥",
            owner: "👑",
            fun: "🎮",
            general: "📖",
            info: "ℹ️",
            tools: "🛠",
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

        const categories = {};

        for (const [name, command] of commands.entries()) {

            if (name !== command.name) continue;

            const cat = command.category || "other";

            if (!categories[cat]) {
                categories[cat] = [];
            }

            categories[cat].push(command);
        }

        if (page && !categories[page]) {
            return sock.sendMessage(jid, {
                text:
`❌ Unknown menu.

Available pages:

👮 admin
👥 group
👑 owner
🎮 fun
📖 general
ℹ️ info
🛠 tools

Example:
.menu admin`
            });
        }

        let menu =
`╔══════════════════════════════════════╗
║              🤖 WHISPERBOT           ║
╠══════════════════════════════════════╣
║ 👤 User      │ ${msg.pushName || "User"}
║ 🌍 Language  │ ${lang}
║ ⚡ Prefix    │ .
║ 📦 Version   │ ${version}
║ ⏱️ Uptime     │ ${uptime}
║ 💾 RAM        │ ${ram} MB
║ 📚 Commands   │ ${commands.size}
╚══════════════════════════════════════╝`;

        if (!page) {

            menu += `

╔════════════ 📂 CATEGORIES ════════════╗`;

Object.keys(categories).forEach(cat => {

    const title =
        cat.charAt(0).toUpperCase() + cat.slice(1);

    menu += `\n║ ${icons[cat] || "📦"} ${title.padEnd(10)} (${categories[cat].length})`;

});

menu += `\n╚══════════════════════════════════════╝`;

menu += `

💡 ${config.language === "fr"
    ? "Utilisez"
    : "Use"}

   *.menu <category>*

📌 Examples
• .menu admin
• .menu tools
• .menu fun`;
        }

        const pages = page ? [page] : [];

        for (const category of pages) {

            const icon = icons[category] || "📦";
            const cmdIcon = commandIcons[category] || "⚙️";

            menu += `

╔══════ ${icon} ${category.toUpperCase()} (${categories[category].length}) ══════╗
`;

            categories[category].forEach((command, index) => {

                menu += `│ ${cmdIcon} *.${command.name}*\n`;
                menu += `│   ${t(command.name)}\n`;

                if (index < categories[category].length - 1) {
                    menu += `│\n`;
                }

            });

            menu += `╚════════════════════════════════════╝`;
        }

        menu += `

╔════════════════════════════════════╗
║ 📚 ${t("total_commands")}: ${commands.size}
║ 🤖 WhisperBot v${version}
╚════════════════════════════════════╝`;
        if (!page) {
    return await sock.sendMessage(jid, {
        text: menu
    });
        }

        await sock.sendMessage(jid, {
            text: menu
        });
        

    }
};
