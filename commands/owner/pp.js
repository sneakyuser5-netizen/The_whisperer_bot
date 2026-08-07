const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const { Readable } = require("stream");
const { t } = require("../../lib/lang");

module.exports = {

    name: "pp",

    description: "Change profile picture",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const quoted =
            msg.message?.extendedTextMessage
                ?.contextInfo?.quotedMessage;

        if (!quoted?.imageMessage) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.pp_usage")
            });
        }

        try {

            const image = await downloadMediaMessage(
                {
                    message: quoted
                },
                "buffer",
                {},
                {
                    logger: sock.logger,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            const stream = Readable.from(image);

            await sock.updateProfilePicture(
                sock.user.id,
                {
                    stream
                }
            );

            await sock.sendMessage(jid, {
                text: t(jid, "owner.pp_updated")
            });

        } catch (err) {

            console.error("Profile picture error:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to update profile picture."
            });

        }

    }

};
