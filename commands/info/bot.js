const os = require("os");
const sudo = require("../../lib/sudo");
const identity = require("../../lib/identity");
const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "bot",
    description: "Show bot information",
    category: "info",
    permission: "sudo",

    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        const uptime = Math.floor(process.uptime());

        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;

        const owner = identity.getBotOwner();
        const sudos = sudo.all(owner).length;

        const botName =
            settings.get("global").bot_name ||
            "NEXORA";

        const text = `
╭━━━〔 🤖 ${botName} 〕━━━╮

👑 ${t(jid, "info.bot_creator")}
𝚃𝚑𝚎 𝚠𝚑𝚒𝚜

🤖 ${t(jid, "info.bot_owner")}
${owner}

🛡️ ${t(jid, "info.bot_sudos")}
${sudos}

━━━━━━━━━━━━━━━━━━━━

⚙️ ${t(jid, "info.bot_platform")}
${os.platform()}

📦 ${t(jid, "info.bot_node")}
${process.version}

⏱️ ${t(jid, "info.bot_uptime")}
${h}h ${m}m ${s}s

━━━━━━━━━━━━━━━━━━━━

✨ ${t(jid, "info.bot_status")}
${t(jid, "info.bot_online")}

╰━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

        await sock.sendMessage(jid, { text });
    }
};
