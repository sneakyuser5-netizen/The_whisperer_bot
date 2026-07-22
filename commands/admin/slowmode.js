const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "slowmode",

    description: "Enable or disable slowmode",

    category: "admin",

    permission: "admin",

    usage: ".slowmode 10",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        const args = body.split(" ").slice(1);

        const option = args[0]?.toLowerCase();


        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const group = settings.get("groups")[jid] || {};

        if (option === "off") {

            settings.set("groups", {
                ...settings.get("groups"),
                [jid]: { ...group, slowmode: 0 }
            });

            return sock.sendMessage(jid, {
                text: t("admin.slowmode_disabled")
            });

        }

        const seconds = parseInt(option);

        if (
            isNaN(seconds) ||
            seconds < 1
        ) {

            return sock.sendMessage(jid, {
                text: t("admin.slowmode_usage")
            });

        }

        settings.set("groups", {
            ...settings.get("groups"),
            [jid]: { ...group, slowmode: seconds }
        });

        await sock.sendMessage(jid, {
            text:
`${t("admin.slowmode_enabled_prefix")} ${seconds}s

${t("admin.slowmode_wait")}`
        });

    }
};
