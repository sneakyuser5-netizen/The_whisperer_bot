const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "anticall",
    description: "Enable or disable auto call rejection",
    category: "owner",
    permission: "owner",
    usage: ".anticall on/off",
    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;
        const option = args[0].toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.anticall_usage")
            });
        }

        const enabled = option === "on";

        settings.set(
            "global",
            "anticall",
            enabled
        );

        await sock.sendMessage(jid, {
            text: enabled
                ? t(jid, "owner.anticall_enabled")
                : t(jid, "owner.anticall_disabled")
        });

    }
};
