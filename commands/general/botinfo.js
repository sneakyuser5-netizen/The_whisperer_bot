const { t } = require("../../lib/lang");

module.exports = {

    name: "botinfo",

    description: "Show information about the bot",

    category: "general",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const text =
`${t(jid, "general.botinfo_title")}

${t(jid, "general.botinfo_version")}: 1.0.0
${t(jid, "general.botinfo_library")}: Baileys
${t(jid, "general.botinfo_language")}: JavaScript (Node.js)

${t(jid, "general.botinfo_developer")}: You`;

        await sock.sendMessage(jid, {
            text
        });

    }

};
