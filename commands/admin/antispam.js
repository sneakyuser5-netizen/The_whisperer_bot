const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "antispam",

    description: "Enable or disable anti-spam",

    category: "admin",

    permission: "admin",

    usage: ".antispam on/off",

    minArgs: 1,


    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: t("group_only")
            });

        }


        const option =
            args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("antispam_usage")
            });

        }


        settings.set(
            jid,
            "antispam",
            option === "on"
        );


        await sock.sendMessage(jid, {

            text:
            option === "on"

            ? t("antispam_enabled")

            : t("antispam_disabled")

        });

    }

};
