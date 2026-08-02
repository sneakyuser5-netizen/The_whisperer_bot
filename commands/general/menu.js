module.exports = {
    name: "menu",
    category: "general",
    description: "Show bot commands",
    permission: "public",

    execute: async (sock, msg, args = []) => {

        const { t } = require("../../lib/lang");
        const { commands } = require("../../handler");
        const settings = require("../../lib/settings");

        const dictionary = require("../../language/source/dictionary");
        const commandFr = require("../../language/source/command-fr");
        const fr = require("../../language/fr");
        const jid = msg.key.remoteJid;
        const page = (args[0] || "").toLowerCase();

        const config = settings.get("global");

        const lang =
            config.language === "fr"
                ? "Français 🇫🇷"
                : "English 🇬🇧";

        const { version } = require("../../package.json");
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
        const categoryBanners = {
    admin: "🛡️ GROUP ADMINISTRATION 🛡️",
    group: "👥 GROUP MANAGEMENT 👥",
    owner: "👑 OWNER PANEL 👑",
    fun: "🎮 FUN & GAMES 🎮",
    general: "📖 GENERAL COMMANDS 📖",
    info: "ℹ️ INFORMATION ℹ️",
    tools: "🛠️ UTILITIES 🛠️",
    other: "📦 OTHER COMMANDS 📦"
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
// ======================================
// Bot Information
// ======================================

// uptime
// RAM
// language
// version

let menu =
`🤖 *WHISPERBOT*

━━━━━━━━━━━━━━━━━━

👤 *User:* ${msg.pushName || "User"}
🌍 *Language:* ${lang}
⚡ *Prefix:* .
📦 *Version:* ${version}
⏱ *Uptime:* ${uptime}
💾 *RAM:* ${ram} MB
📚 *Commands:* ${commands.size}`;
if (!page) {

    menu += `

━━━━━━━━━━━━━━━━━━

📂 *${config.language === "fr" ? "CATÉGORIES" : "CATEGORIES"}*

`;

    Object.keys(categories).forEach(cat => {

        menu += `${icons[cat] || "📦"} *${cat.charAt(0).toUpperCase() + cat.slice(1)}* (${categories[cat].length})\n`;

    });

    menu += `

━━━━━━━━━━━━━━━━━━

💡 ${
config.language === "fr"
? "Utilisez"
: "Use"
}

*.menu <category>*

${
config.language === "fr"
? "Exemples"
: "Examples"
}

• .menu admin
• .menu tools
• .menu fun`;

    return await sock.sendMessage(jid, {
        text: menu
    });
}
const icon = icons[page] || "📦";
const cmdIcon = commandIcons[page] || "⚙️";
const banner = categoryBanners[page] || page.toUpperCase();

menu += `

━━━━━━━━━━━━━━━━━━

${icon} *${banner}*

━━━━━━━━━━━━━━━━━━

`;

for (const [index, command] of categories[page].entries()) {

let description =
    config.language === "fr"
        ? (commandFr[command.name] || dictionary[command.name] || command.description)
        : (dictionary[command.name] || command.description);
    menu += `${cmdIcon} *.${command.name}*\n`;
    menu += `${description}\n`;

    if (index < categories[page].length - 1) {
        menu += `\n━━━━━━━━━━━━━━━━━━\n\n`;
    }
}


  
if (!page) {
    menu += `

╔════════════════════════════════════╗
║ 📚 ${t("total_commands")}: ${commands.size}
║ 🤖 WhisperBot v${version}
╚════════════════════════════════════╝`;
} else {
menu += `

━━━━━━━━━━━━━━━━━━

💡 ${
config.language === "fr"
? "Tapez *.menu* pour revenir aux catégories."
: "Type *.menu* to return to categories."
}`;
}

await sock.sendMessage(jid, {
    text: menu
});        

    }
};
