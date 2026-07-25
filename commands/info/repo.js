const { t } = require("../../lib/lang");

module.exports = {

    name: "repo",

    description: "Show bot repository",

    category: "info",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`${t("info.repo_title")}

🤖 ${t("info.repo_project")}
Whisper Bot

👑 ${t("info.repo_owner")}
THE-WHISPERER-237

🔗 GitHub:
https://github.com/sneakyuser5-netizen/The_whisperer_bot

⭐ ${t("info.repo_footer")}`
        });

    }

};
