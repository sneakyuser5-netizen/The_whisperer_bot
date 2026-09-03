const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "public",

    description: "Allow everyone to use the bot",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        settings.set(
            "global",
            "mode",
            "public"
        );

        await sock.sendMessage(jid, {
            text: t("owner.public_enabled")
        });

    }

};
