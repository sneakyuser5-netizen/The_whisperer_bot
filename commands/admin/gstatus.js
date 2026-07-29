const {
    downloadMediaMessage,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const { t } = require("../../lib/lang");

module.exports = {

    name: "userstatus",

    description: "Post replied media to your WhatsApp status",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "You're not the bot owner")
            });
        }

        const quoted =
            msg.message?.extendedTextMessage
                ?.contextInfo
                ?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, {
                text: t(jid, "Reply to message, image or video")
            });
        }

        try {

            const meta = await sock.groupMetadata(jid);

            const statusJidList = meta.participants
                .map(p => jidNormalizedUser(p.id));

            console.log("STATUS RECIPIENTS:", statusJidList.length);

            let content = {};

            if (quoted.imageMessage) {

                const buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer",
                    {}
                );

                content = {
                    image: buffer,
                    caption: quoted.imageMessage.caption || ""
                };

            } else if (quoted.videoMessage) {

                const buffer = await downloadMediaMessage(
                    { message: quoted },
                    "buffer",
                    {}
                );

                content = {
                    video: buffer,
                    caption: quoted.videoMessage.caption || ""
                };

            } else {

                return sock.sendMessage(jid, {
                    text: t(jid, "You're not the bot owner")
                });

            }

            const sent = await sock.sendMessage(
                "status@broadcast",
                content,
                {
                    statusJidList
                }
            );

            console.log("STATUS SENT:", sent);

            await sock.sendMessage(jid, {
                text: t(jid, "_Your status have been posted successfully_")
            });

        } catch (err) {

            console.log("GSTATUS ERROR:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "``Failled to update status``")
            });

        }

    }

};
