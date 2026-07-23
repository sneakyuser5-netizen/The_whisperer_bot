const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

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
                text: t(jid, "admin.only_groups")
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
`${t(jid, "admin.lock_valid_types")}

${types.join(", ")}`
            });

        }

        settings.set(
            jid,
            "lock_" + type,
            true
        );

        await sock.sendMessage(jid, {
            text: `${t(jid, "admin.lock_locked_emoji")} ${type} ${t(jid, "admin.lock_locked_text")}`
        });

    }

};
