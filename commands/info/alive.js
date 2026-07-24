const { t } = require("../../lib/lang");

module.exports = {

    name: "alive",

    description: "Check if bot is alive",

    category: "info",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`${t("info.alive_title")}

👑 ${t("info.alive_owner")}
THE-WHISPERER-237

⚡ ${t("info.alive_status")}
${t("info.alive_running")}

😂 ${t("info.alive_footer")}`
        });

    }

};
