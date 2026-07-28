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

const ram =
    (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

let menu =
`╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      🤖 *WhisperBot*
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 User      : ${msg.pushName || "User"}
┃ 🌍 Language  : ${lang}
┃ ⚡ Prefix    : .
┃ 📦 Version   : ${version}
┃ ⏱ Uptime    : ${uptime}
┃ 💾 RAM       : ${ram} MB
┃ 📚 Commands  : ${commands.size}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
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
        const commandIcons = {
    admin: "🛡️",
    group: "👥",
    fun: "🎲",
    general: "📖",
    info: "ℹ️",
    owner: "👑",
    tools: "🛠️",
    other: "📦"
};


        for (const category in categories) {

            const icon = icons[category] || "📦";
            const cmdIcon = commandIcons[category] || "⚙️";

menu += `

╭──『 ${icon} *${category.toUpperCase()}* (${categories[category].length}) 』──╮
`;

            for (const command of categories[category]) {

                menu += `├────────────────────\n`;
menu += `│ ${cmdIcon} *.${command.name}*\n`;
menu += `│ ${t(command.name)}\n`;
menu += `│\n`;

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
