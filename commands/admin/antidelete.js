const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "antidelete",

    description: "Enable or disable anti-delete",

    category: "admin",

    permission: "admin",

    usage: ".antidelete on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        const option = (args[0] || "").toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t("antidelete_usage")
            });
        }

        settings.set(
            jid,
            "antidelete",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text: option === "on" ? t("antidelete_enabled") : t("antidelete_disabled")
        });

    }

};
