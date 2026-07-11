const settings = require("../../lib/settings");

module.exports = {

    name: "public",

    description: "Allow everyone to use the bot",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        settings.set(
            "global",
            "mode",
            "public"
        );

        await sock.sendMessage(jid, {
            text:
`🌍 *PUBLIC MODE ENABLED*

😂 WhisperBot has opened its doors.

Everyone can now use public commands.

(Owner and sudo permissions are still respected.)`
        });

    }

};
