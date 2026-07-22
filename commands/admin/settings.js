const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "settings",

    description: "Show group settings",

    category: "admin",

    permission: "admin",

    usage: ".settings",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const group = settings.get("groups")[jid] || {};

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const groupSettings = settings.get("groups")[jid];

        await sock.sendMessage(jid, {

            text:
`${t("admin.settings_title")}

${t("admin.settings_antilink")} : ${groupSettings.antilink ? t("admin.on") : t("admin.off")}

${t("admin.settings_welcome")} : ${groupSettings.welcome ? t("admin.on") : t("admin.off")}

${t("admin.settings_antigm")} : ${groupSettings.antigm ? t("admin.on") : t("admin.off")}

${t("admin.settings_goodbye")} : ${groupSettings.goodbye ? t("admin.on") : t("admin.off")}`

        });

    }
};
