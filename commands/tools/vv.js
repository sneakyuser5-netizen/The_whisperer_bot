const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const { t } = require("../../lib/lang");

module.exports = {

    name: "vv",

    description: "Retrieve view once media",

    category: "tools",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const quoted =
            msg.message?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, {
                text: t("tools.vv_reply")
            });
        }

        let media;

        if (quoted.viewOnceMessageV2) {

            media = quoted.viewOnceMessageV2.message;

        } else if (quoted.viewOnceMessage) {

            media = quoted.viewOnceMessage.message;

        } else {

            media = quoted;

        }

        try {

            if (media.imageMessage) {

                const buffer = await downloadMediaMessage(
                    {
                        message: media
                    },
                    "buffer",
                    {}
                );

                await sock.sendMessage(jid, {
                    image: buffer,
                    caption: media.imageMessage.caption || ""
                });

            } else if (media.videoMessage) {

                const buffer = await downloadMediaMessage(
                    {
                        message: media
                    },
                    "buffer",
                    {}
                );

                await sock.sendMessage(jid, {
                    video: buffer,
                    caption: media.videoMessage.caption || ""
                });

            } else {

                await sock.sendMessage(jid, {
                    text: t("tools.vv_unsupported")
                });

            }

        } catch (err) {

            console.log("VV ERROR:", err);

            await sock.sendMessage(jid, {
                text: t("tools.vv_failed")
            });

        }

    }

};
