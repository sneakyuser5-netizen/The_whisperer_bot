const {
    downloadMediaMessage,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const { t } = require("../../lib/lang");

module.exports = {

    name: "gstatus",

    description: "Post replied media to WhatsApp status",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        console.log("GSTATUS STARTED");

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const quoted =
            msg.message?.extendedTextMessage
                ?.contextInfo
                ?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.gstatus_reply_media")
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
                    text: t(jid, "admin.gstatus_only_supported")
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
                text: t(jid, "admin.gstatus_posted")
            });

        } catch (err) {

            console.log("GSTATUS ERROR:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "admin.gstatus_failed")
            });

        }

    }

};
