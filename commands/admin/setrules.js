const settings = require("../../lib/settings");

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
                text: "❌ This command only works in groups."
            });
        }


        const rules = args.join(" ");


        settings.set(
            jid,
            "rules",
            rules
        );


        await sock.sendMessage(jid, {
            text:
`📜 Group rules updated.

😂 The law book has been rewritten.`
        });

    }

};
