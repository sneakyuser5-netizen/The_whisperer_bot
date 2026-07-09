const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");


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
                text: "❌ Reply to a view once message."
            });

        }


        let mediaMessage;


        if (quoted.viewOnceMessage) {

            mediaMessage =
                quoted.viewOnceMessage.message;

        } else if (quoted.viewOnceMessageV2) {

            mediaMessage =
                quoted.viewOnceMessageV2.message;

        } else if (
            quoted.imageMessage?.viewOnce ||
            quoted.videoMessage?.viewOnce
        ) {

            mediaMessage = quoted;

        }


        if (!mediaMessage) {

            return sock.sendMessage(jid, {
                text: "❌ This is not a view once message."
            });

        }


        try {

            await sock.sendMessage(
                jid,
                mediaMessage
            );

        } catch (err) {

            console.log("VV ERROR:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to retrieve view once media."
            });

        }

    }

};
