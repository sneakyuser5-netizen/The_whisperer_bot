const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "goodbye",

    description: "Enable or disable goodbye messages",

    category: "admin",

    permission: "admin",

    usage: ".goodbye on/off",

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
                text: t(jid, "admin.goodbye_usage")
            });
        }

        settings.set(jid, "goodbye", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
                ? t(jid, "admin.goodbye_enabled")
                : t(jid, "admin.goodbye_disabled")
        });

    }

};
