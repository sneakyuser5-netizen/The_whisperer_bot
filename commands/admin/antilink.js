const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");


module.exports = {

    name: "antilink",

    description: "Enable or disable anti-link",

    category: "admin",

    permission: "admin",

    usage: ".antilink on/off",

    minArgs: 1,


    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }


        const option = args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("antilink_usage")
            });

        }


        settings.set(
    jid,
    "antilink",
    option === "on"
);


        await sock.sendMessage(jid, {
            text:
            option === "on"
            ? t("antilink_enabled")
            : t("antilink_disabled")
        });

    }

};
