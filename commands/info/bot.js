const os = require("os");
const sudo = require("../../lib/sudo");
const settings = require("../../lib/settings");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "bot",

    description: "Show bot information",

    category: "info",

    permission: "public",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const uptime = Math.floor(process.uptime());

        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;

        const owner = identity.getBotOwner();
        const sudos = sudo.all(owner).length;
        const mode = settings.get("global").mode || "private";

        const text =
`${t("info.bot_title")}

━━━━━━━━━━━━━━

👑 ${t("info.bot_creator")}
THE-WHISPERER-237

🤖 ${t("info.bot_owner")}
${owner}

🛡️ ${t("info.bot_sudos")}
${sudos}

🌍 ${t("info.bot_mode")}
${mode}

⚙️ ${t("info.bot_platform")}
${os.platform()}

📦 ${t("info.bot_node")}
${process.version}

⏱️ ${t("info.bot_uptime")}
${h}h ${m}m ${s}s

━━━━━━━━━━━━━━`;

        await sock.sendMessage(jid, {
            text
        });

    }

};
