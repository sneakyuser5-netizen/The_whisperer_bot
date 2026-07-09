const settings = require("../../lib/settings");

module.exports = {

    name: "autorecording",

    description: "Enable or disable auto recording",

    category: "owner",

    permission: "owner",

    usage: ".autorecording on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text:
`😂 Try this:

.autorecording on
.autorecording off`
            });

        }


        settings.set(
            "global",
            "autorecording",
            option === "on"
        );


        await sock.sendMessage(jid, {
            text:
option === "on"
?
"🎙️ Auto recording enabled.\n\nI am preparing my imaginary voice note 😂"
:
"✅ Auto recording disabled."
        });

    }

};
