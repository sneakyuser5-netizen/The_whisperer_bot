const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "autorecording",

    description: "Enable or disable auto recording",

    category: "owner",

    permission: "owner",

    usage: ".autorecording on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("owner.autorecording_usage")
            });

        }

        settings.set(
            "global",
            "autorecording",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                    ? t("owner.autorecording_enabled")
                    : t("owner.autorecording_disabled")
        });

    }

};
