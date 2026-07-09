const settings = require("../../lib/settings");

module.exports = {

    name: "autotyping",

    description: "Enable or disable auto typing",

    category: "owner",

    permission: "owner",

    usage: ".autotyping on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text:
`😂 Use it properly:

.autotyping on
.autotyping off`
            });

        }


        settings.set(
            "global",
            "autotyping",
            option === "on"
        );


        await sock.sendMessage(jid, {
            text:
option === "on"
?
"⌨️ Auto typing enabled.\n\nNow I will pretend I'm thinking 😂"
:
"✅ Auto typing disabled."
        });

    }

};
