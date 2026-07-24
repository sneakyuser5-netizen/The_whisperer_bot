const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "delrules",

    description: "Delete group rules",

    category: "admin",

    permission: "admin",

    usage: ".delrules",


    execute: async (sock, msg) => {

        const jid =
            msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: t("group_only")
            });

        }


        settings.set(
            jid,
            "rules",
            ""
        );


        await sock.sendMessage(jid, {

            text: t("delrules_success")

        });

    }

};
