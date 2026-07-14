const settings = require("../../lib/settings");

module.exports = {

    name: "rules",

    description: "Show group rules",

    category: "general",

    usage: ".rules",


    execute: async (sock, msg) => {

        const jid =
            msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text:
                "❌ This command only works in groups."
            });

        }


        const data =
            settings.get(jid);


        if (!data.rules) {

            return sock.sendMessage(jid, {

                text:
`📜 No rules have been set yet.

😂 The group is currently running on vibes only.`

            });

        }


        await sock.sendMessage(jid, {

            text:
`📜 Group Rules:

${data.rules}

😂 Follow the rules and stay out of moderator trouble.`

        });

    }

};
