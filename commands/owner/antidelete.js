const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {
    name: "antidelete",
    description: "Enable or disable anti-delete",
    category: "owner",
    permission: "owner",
    usage: ".antidelete on/off",

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;

        const option = (args[0] || "").toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t(jid, "antidelete_usage")
            });
        }

        settings.set(
            jid,
            "antidelete",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text: option === "on"
                ? t(jid, "antidelete_enabled")
                : t(jid, "antidelete_disabled")
        });
    }
};
