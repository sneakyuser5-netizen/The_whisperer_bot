const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "welcome",

    description: "Enable or disable welcome messages",

    category: "admin",

    permission: "admin",

    usage: ".welcome on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.welcome_usage")
            });

        }

        settings.set(
            jid,
            "welcome",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                    ? t(jid, "admin.welcome_enabled")
                    : t(jid, "admin.welcome_disabled")
        });

    }

};
