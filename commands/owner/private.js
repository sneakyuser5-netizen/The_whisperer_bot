const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "private",

    description: "Only owner and sudo can use the bot",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        settings.set(
            "global",
            "mode",
            "private"
        );

        await sock.sendMessage(jid, {
            text: t("owner.private_enabled")
        });

    }

};
