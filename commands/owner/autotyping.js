const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "autotyping",

    description: "Enable or disable auto typing",

    category: "owner",

    permission: "owner",

    usage: ".autotyping on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("owner.autotyping_usage")
            });

        }

        settings.set(
            "global",
            "autotyping",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                    ? t("owner.autotyping_enabled")
                    : t("owner.autotyping_disabled")
        });

    }

};
