const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {
    name: "antibot",

    description: "Enable or disable anti-bot protection",

    category: "admin",

    permission: "admin",

    usage: ".antibot on/off/status",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        const option = (args[0] || "").toLowerCase();

        if (!["on", "off", "status"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t("antibot_usage")
            });
        }

        const enabled = settings.get(jid).antibot === true;

        if (option === "status") {
            return sock.sendMessage(jid, {
                text: enabled
                    ? t("antibot_status_enabled")
                    : t("antibot_status_disabled")
            });
        }

        settings.set(jid, "antibot", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
                ? t("antibot_enabled")
                : t("antibot_disabled")
        });
    }
};
