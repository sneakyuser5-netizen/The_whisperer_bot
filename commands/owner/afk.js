const settings = require("../../lib/settings");

module.exports = {

    name: "afk",

    description: "Enable or disable AFK mode",

    category: "owner",

    permission: "owner",

    usage: ".afk on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text:
`😂 Tell me what to do.

.afk on
.afk off`
            });

        }


        settings.set(
            "global",
            "afk",
            option === "on"
        );


        await sock.sendMessage(jid, {
            text:
option === "on"
?
"😴 AFK mode activated.\n\nThe owner has entered sleep mode 😂"
:
"👋 AFK mode disabled.\n\nThe owner has returned!"
        });

    }

};
