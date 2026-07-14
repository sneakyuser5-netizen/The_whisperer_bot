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
                text:
                "❌ This command only works in groups."
            });

        }


        settings.set(
            jid,
            "rules",
            ""
        );


        await sock.sendMessage(jid, {

            text:
`🗑️ Group rules removed.

😂 The law book has been burned... temporarily.`

        });

    }

};
