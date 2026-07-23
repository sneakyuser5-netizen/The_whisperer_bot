const {
    downloadMediaMessage
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

            if (quoted.imageMessage) {

                const buffer = await downloadMediaMessage(
                    {
                        message: quoted
                    },
                    "buffer",
                    {}
                );

                const sent = await sock.sendMessage(
                    "status@broadcast",
                    {
                        image: buffer,
                        caption: quoted.imageMessage.caption || ""
                    }
                );

                console.log("STATUS SENT:", sent.key);

            }

            else if (quoted.videoMessage) {

                const buffer = await downloadMediaMessage(
                    {
                        message: quoted
                    },
                    "buffer",
                    {}
                );

                const sent = await sock.sendMessage(
                    "status@broadcast",
                    {
                        video: buffer,
                        caption: quoted.videoMessage.caption || ""
                    }
                );

                console.log("STATUS SENT:", sent.key);

            }

            else {

                return sock.sendMessage(jid, {
                    text: t(jid, "admin.gstatus_only_supported")
                });

            }

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
