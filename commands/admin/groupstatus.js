module.exports = {
    name: "groupstatus",
    category: "admin",
    description: "Post a group status",
    permission: "admin",

    execute: async (sock, msg) => {
        const { t } = require("../../lib/lang");
        const jid = msg.key.remoteJid;

        if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return sock.sendMessage(jid, {
                text: "❌ Reply to an image, video or text."
            });
        }

        const quoted =
            msg.message.extendedTextMessage.contextInfo.quotedMessage;

        try {

            // Image
            if (quoted.imageMessage) {
                const media = await sock.downloadMediaMessage({
                    key: msg.message.extendedTextMessage.contextInfo.stanzaId
                        ? {
                              remoteJid: jid,
                              id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                              participant:
                                  msg.message.extendedTextMessage.contextInfo.participant
                          }
                        : null,
                    message: quoted
                });

                await sock.sendMessage("status@broadcast", {
                    image: media,
                    caption: ""
                });
            }

            // Video
            else if (quoted.videoMessage) {
                const media = await sock.downloadMediaMessage({
                    key: {
                        remoteJid: jid,
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                        participant:
                            msg.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quoted
                });

                await sock.sendMessage("status@broadcast", {
                    video: media,
                    caption: ""
                });
            }

            // Text
            else if (quoted.conversation || quoted.extendedTextMessage) {
                const text =
                    quoted.conversation ||
                    quoted.extendedTextMessage.text;

                await sock.sendMessage("status@broadcast", {
                    text
                });
            }

            else {
                return sock.sendMessage(jid, {
                    text: "❌ Unsupported message."
                });
            }

            await sock.sendMessage(jid, {
                text: "✅ Status posted successfully."
            });

        } catch (err) {
            console.error(err);

            await sock.sendMessage(jid, {
                text: `❌ ${err.message}`
            });
        }
    }
};
