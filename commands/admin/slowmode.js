const settings = require("../../lib/settings");

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
                text: "❌ This command only works in groups."
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
                text:
                "🚦 Slowmode disabled.\n😂 Everyone can talk freely again."
            });

        }


        const seconds = Number(option);


        if (
            isNaN(seconds) ||
            seconds < 1
        ) {

            return sock.sendMessage(jid, {
                text:
                "❌ Use:\n.slowmode 10\n.slowmode off"
            });

        }


        settings.set(
            jid,
            "slowmode",
            seconds
        );


        await sock.sendMessage(jid, {
            text:
`🚦 Slowmode enabled: ${seconds}s

😂 Messages must now wait their turn.`
        });

    }

};
