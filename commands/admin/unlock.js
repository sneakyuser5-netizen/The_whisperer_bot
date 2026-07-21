const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");
module.exports = {

    name: "unlock",

    description: "Unlock a message type",

    category: "admin",

    permission: "admin",

    usage: ".unlock sticker",

    minArgs: 1,


    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "group_only")
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
`${t(jid, "choose_one")}

${types.join(", ")}`
    });

        }


        settings.set(
            jid,
            "lock_" + type,
            false
        );


        await sock.sendMessage(jid, {
            text:
`🔓 ${type} unlocked.

😂 The ${type} prisoners escaped from admin jail.`
        });

    }

};
