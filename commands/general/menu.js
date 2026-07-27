module.exports = {

    name: "menu",

    category: "general",

    description: "Show bot commands",

    permission: "public",

    execute: async (sock, msg) => {

        const { t } = require("../../lib/lang");
        const { commands } = require("../../handler");

        const jid = msg.key.remoteJid;

        const settings = require("../../lib/settings");

const global = settings.get("global");

const lang =
    global.language === "fr"
        ? "Français 🇫🇷"
        : "English 🇬🇧";

const version = "1.0.0";

const uptime = () => {

    const seconds =
        Math.floor((Date.now() - global.START_TIME) / 1000);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;

};

let menu =
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      🤖 *WhisperBot*
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🌍 Language : ${lang}
┃ ⚡ Prefix   : .
┃ 📦 Version  : ${version}
┃ ⏱ Uptime   : ${uptime()}
┃ 📚 Commands : ${commands.size}
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

        const categories = {};

        for (const [name, command] of commands.entries()) {

            if (name !== command.name) continue;

            const category = command.category || "other";

            if (!categories[category]) {
                categories[category] = [];
            }

            categories[category].push(command);

        }
        const icons = {
    admin: "👮",
    group: "👥",
    fun: "🎮",
    general: "📖",
    info: "ℹ️",
    owner: "👑",
    tools: "🛠",
    other: "📦"
};

        for (const category in categories) {

            const icon = icons[category] || "📦";

menu += `

╭──『 ${icon} *${category.toUpperCase()}* (${categories[category].length}) 』──╮
`;

            for (const command of categories[category]) {

                menu += `│ ➤ *.${command.name}*\n`;
                menu += `│    ${t(command.name)}\n`;
                menu += "│\n";

            }

            menu += "╰────────────────────╯\n";

        }

        menu += `

📚 *${t("total_commands")}:* ${commands.size}`;

        await sock.sendMessage(jid, {
            text: menu
        });

    }

};
