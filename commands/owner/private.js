const settings = require("../../lib/settings");

module.exports = {

    name: "private",

    description: "Only owner and sudo can use the bot",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        settings.set(
            "global",
            "mode",
            "private"
        );

        await sock.sendMessage(jid, {
            text:
`🔒 *PRIVATE MODE ENABLED*

😂 The boss locked the doors.

Only the owner and sudo members can use me now.`
        });

    }

};
