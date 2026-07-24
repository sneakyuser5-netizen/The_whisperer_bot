const { downloadMediaMessage } = require("@whiskeysockets/baileys");
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
            ?.contextInfo
            ?.quotedMessage;

        if (!quoted?.imageMessage) {

            return sock.sendMessage(jid, {
                text: t("owner.pp_usage")
            });

        }

        const image = await downloadMediaMessage(
            {
                message: quoted
            },
            "buffer",
            {}
        );

        await sock.updateProfilePicture(
            sock.user.id,
            image
        );

        await sock.sendMessage(jid, {
            text: t("owner.pp_updated")
        });

    }

};
