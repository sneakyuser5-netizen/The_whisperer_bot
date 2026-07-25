const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "settings",

    description: "Show current group settings",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const group = settings.get(jid);

        await sock.sendMessage(jid, {

            text:
`${t(jid, "admin.settings_title")}

${t(jid, "admin.settings_antilink")} : ${group.antilink ? t(jid, "admin.on") : t(jid, "admin.off")}

${t(jid, "admin.settings_welcome")} : ${group.welcome ? t(jid, "admin.on") : t(jid, "admin.off")}

${t(jid, "admin.settings_antigm")} : ${group.antigm ? t(jid, "admin.on") : t(jid, "admin.off")}

${t(jid, "admin.settings_goodbye")} : ${group.goodbye ? t(jid, "admin.on") : t(jid, "admin.off")}`

        });

    }

};
