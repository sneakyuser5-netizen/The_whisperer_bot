const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "setrules",

    description: "Set group rules",

    category: "admin",

    permission: "admin",

    usage: ".setrules text",

    minArgs: 1,


    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }


        const rules = args.join(" ");


        settings.set(
            jid,
            "rules",
            rules
        );


        await sock.sendMessage(jid, {
            text: t(jid, "admin.setrules_updated")
        });

    }

};
