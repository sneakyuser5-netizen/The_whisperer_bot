const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "slowmode",
    description: "Set group slowmode",
    category: "admin",
    permission: "admin",
    usage: ".slowmode 10/off",
    minArgs: 1,

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups") // FIXED
            });
        }

        const option = args[0].toLowerCase();

        if (option === "off") {
            settings.set(jid, "slowmode", 0);
            return sock.sendMessage(jid, {
                text: t("admin.slowmode_disabled") // FIXED
            });
        }

        const seconds = Number(option);

        if (isNaN(seconds) || seconds < 1) {
            return sock.sendMessage(jid, {
                text: t("admin.slowmode_usage") // FIXED
            });
        }

        settings.set(jid, "slowmode", seconds);

        await sock.sendMessage(jid, {
            text: `${t("admin.slowmode_enabled_prefix")} ${seconds}s\n\n${t("admin.slowmode_wait")}` // FIXED
        });
    }
};
