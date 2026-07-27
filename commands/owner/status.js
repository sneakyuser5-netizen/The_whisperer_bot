const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "status",
    description: "Enable or disable status saving",
    category: "owner",
    permission: "owner",
    usage: ".status on/off",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t("owner.status_usage")
            });
        }

        settings.set("global", "status_saver", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
              ? t("owner.status_enabled")
                : t("owner.status_disabled")
        });
    }
};
