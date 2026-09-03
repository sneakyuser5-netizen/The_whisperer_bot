const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "botinfo",

    description: "Show information about the bot",

    category: "general",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const botName =
            settings.get("global").bot_name ||
            "Whisperer_Bot";

        const text =
`🤖 *${botName}*

${t(jid, "general.botinfo_version")}: 1.0.0
${t(jid, "general.botinfo_library")}: Baileys
${t(jid, "general.botinfo_language")}: JavaScript (Node.js)

${t(jid, "general.botinfo_developer")}: You`;

        await sock.sendMessage(jid, {
            text
        });

    }

};
