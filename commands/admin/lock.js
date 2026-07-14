const settings = require("../../lib/settings");

module.exports = {

    name: "lock",

    description: "Lock a message type",

    category: "admin",

    permission: "admin",

    usage: ".lock sticker",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const types = [
            "sticker",
            "image",
            "video",
            "audio",
            "document",
            "poll"
        ];

        const type = args[0]?.toLowerCase();

        if (!types.includes(type)) {

            return sock.sendMessage(jid, {
                text:
`❌ Valid types:

${types.join(", ")}`
            });

        }

        settings.set(
            jid,
            "lock_" + type,
            true
        );

        await sock.sendMessage(jid, {
            text: `🔒 ${type} has been locked.`
        });

    }

};
