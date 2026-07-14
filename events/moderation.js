const settings = require("../lib/settings");

module.exports = {

    name: "moderation",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        if (!msg.message) return;

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) return;


        const groupSettings = settings.get(jid);


        const lockedTypes = {

            sticker:
            msg.message.stickerMessage,

            image:
            msg.message.imageMessage,

            video:
            msg.message.videoMessage,

            audio:
            msg.message.audioMessage,

            document:
            msg.message.documentMessage,

            poll:
            msg.message.pollCreationMessage

        };


        let locked = null;


        for (const type in lockedTypes) {

            if (
                lockedTypes[type] &&
                groupSettings["lock_" + type]
            ) {
                locked = type;
                break;
            }

        }


        if (!locked) return;


        try {

            const metadata =
                await sock.groupMetadata(jid);


            const sender =
                msg.key.participant;


            const member =
                metadata.participants.find(p => {

                    const id =
                    (p.id || p.jid || "")
                    .split(":")[0];

                    return id ===
                    sender.split(":")[0];

                });


            if (member?.admin) return;


            await sock.sendMessage(jid, {
                delete: msg.key
            });


            await sock.sendMessage(jid, {

                text:
`🚫 ${locked} is locked.

😂 The admin put this message type in jail.`

            });


        } catch (err) {

            console.log(
                "Moderation error:",
                err
            );

        }

    }

};
