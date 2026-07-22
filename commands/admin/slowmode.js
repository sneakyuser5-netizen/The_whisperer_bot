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
                text: t(jid, "admin.only_groups")
            });
        }


        const option = args[0].toLowerCase();


        if (option === "off") {

            settings.set(
                jid,
                "slowmode",
                0
            );

            return sock.sendMessage(jid, {
                text: t(jid, "admin.slowmode_disabled")
            });

        }


        const seconds = Number(option);


        if (
            isNaN(seconds) ||
            seconds < 1
        ) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.slowmode_usage")
            });

        }


        settings.set(
            jid,
            "slowmode",
            seconds
        );


        await sock.sendMessage(jid, {
            text:
`${t(jid, "admin.slowmode_enabled_prefix")} ${seconds}s

${t(jid, "admin.slowmode_wait")}`
        });

    }

};
