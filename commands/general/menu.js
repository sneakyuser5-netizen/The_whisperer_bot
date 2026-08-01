function makeBox(lines, separatorIndexes = []) {
    const width = Math.max(...lines.map(line => line.length), 38);

    let text = "╔" + "═".repeat(width + 2) + "╗\n";

    lines.forEach((line, index) => {
        text += `║ ${line.padEnd(width)} ║`;

        if (index !== lines.length - 1) {
            if (separatorIndexes.includes(index)) {
                text += "\n╠" + "═".repeat(width + 2) + "╣\n";
            } else {
                text += "\n";
            }
        }
    });

    text += "\n" + "╚" + "═".repeat(width + 2) + "╝";

    return text;
}
function center(text, width = 38) {
    const left = Math.floor((width - text.length) / 2);
    const right = width - text.length - left;
    return " ".repeat(Math.max(0, left)) +
           text +
           " ".repeat(Math.max(0, right));
}
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

const infoLine = (label, value) =>
    `║ ${label.padEnd(11)}│ ${String(value).padEnd(24)}║`;

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
let menu =
`╔════════════════════════════════════════╗
║ 🤖 WHISPERBOT                          ║
╠════════════════════════════════════════╣
${infoLine("👤 User", msg.pushName || "User")}
${infoLine("🌍 Language", lang)}
${infoLine("⚡ Prefix", ".")}
${infoLine("📦 Version", version)}
${infoLine("⏱️ Uptime", uptime)}
${infoLine("💾 RAM", `${ram} MB`)}
${infoLine("📚 Commands", commands.size)}
╚════════════════════════════════════════╝`;

if (!page) {

menu += `

╔════════════════════════════════════════╗
║ 📂 CATEGORIES                         ║
╠════════════════════════════════════════╣`;

Object.keys(categories).forEach(cat => {

    const name = cat.charAt(0).toUpperCase() + cat.slice(1);

    const line =
        `${icons[cat] || "📦"} ${name}`.padEnd(18) +
        `(${categories[cat].length})`;

    menu += `\n║ ${line.padEnd(38)} ║`;

});


menu += `

${config.language === "fr"
? "💡 Tapez *.menu <catégorie>*"
: "💡 Type *.menu <category>*"}

${config.language === "fr"
? "Exemples :"
: "Examples:"}

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

╔══════════════════════════════════════╗
║ ${banner.padEnd(36, " ")}║
╠══════════════════════════════════════╣
`;

categories[page].forEach((command, index) => {

    
menu += `║ ${cmdIcon} *.${command.name}*\n`;
menu += `║   ${t(command.name)}\n`;

if (index < categories[page].length - 1) {
    menu += `╟──────────────────────────────────────╢\n`;
}

});

menu += `
╚══════════════════════════════════════╝`;


if (!page) {
    menu += `

╔════════════════════════════════════╗
║ 📚 ${t("total_commands")}: ${commands.size}
║ 🤖 WhisperBot v${version}
╚════════════════════════════════════╝`;
} else {
    menu += `

💡 ${config.language === "fr"
    ? "Tapez .menu pour revenir aux catégories."
    : "Type .menu to return to categories."}`;
}

await sock.sendMessage(jid, {
    text: `\`\`\`
${menu}
\`\`\``
});        

    }
};
