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
        const botName =
    config.bot_name || "Whisperer_Bot";

let menu =
`🤖 *${botName}*

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

📂 *${t("menu_categories")}*

`;

    Object.keys(categories).forEach(cat => {

        menu += `${icons[cat] || "📦"} *${cat.charAt(0).toUpperCase() + cat.slice(1)}* (${categories[cat].length})\n`;

    });

    menu += `

━━━━━━━━━━━━━━━━━━

💡 ${
t("menu_use")
}

*.menu <category>*

${
t("menu_examples")
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
║ 🤖 ${botName} v${version}
╚════════════════════════════════════╝`;
} else {
menu += `

━━━━━━━━━━━━━━━━━━

💡 ${
t("menu_return")
}`;
}

await sock.sendMessage(jid, {
    text: menu
});        

    }
};
