const { t } = require("../../lib/lang");

module.exports = {
    name: "github",
    description: "Show the GitHub repository",
    category: "info",
    permission: "public",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const repo = "https://github.com/sneakyuser5-netizen/The_whisperer_bot";

        await sock.sendMessage(jid, {
            text:
`${t(jid, "github_title")}

📦 ${t(jid, "github_repository")}
${repo}

⭐ ${t(jid, "github_star")}`
        });
    }
};
