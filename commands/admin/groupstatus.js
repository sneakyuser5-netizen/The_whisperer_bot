const {
    generateWAMessageContent,
    generateWAMessageFromContent
} = require("@whiskeysockets/baileys");

const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

module.exports = {
    name: "groupstatus",
    category: "admin",
    description: "Post a WhatsApp Group Status",
    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        if (!context?.quotedMessage) {
            return sock.sendMessage(jid, {
                text: "❌ Reply to an image, video or text."
            });
        }

        const quoted = context.quotedMessage;

        try {

            let content;

            // TEXT
            if (quoted.conversation || quoted.extendedTextMessage) {

                content = {
                    text:
                        quoted.conversation ||
                        quoted.extendedTextMessage.text
                };

            }

            // IMAGE
            else if (quoted.imageMessage) {

                const media = await downloadMediaMessage(
                    {
                        key: {
                            remoteJid: jid,
                            id: context.stanzaId,
                            participant: context.participant
                        },
                        message: quoted
                    },
                    "buffer",
                    {},
                    {
                        logger: sock.logger,
                        reuploadRequest: sock.updateMediaMessage
                    }
                );

                content = await generateWAMessageContent(
                    {
                        image: media,
                        caption: quoted.imageMessage.caption || ""
                    },
                    {
                        upload: sock.waUploadToServer
                    }
                );

            }

            // VIDEO
            else if (quoted.videoMessage) {

                const media = await downloadMediaMessage(
                    {
                        key: {
                            remoteJid: jid,
                            id: context.stanzaId,
                            participant: context.participant
                        },
                        message: quoted
                    },
                    "buffer",
                    {},
                    {
                        logger: sock.logger,
                        reuploadRequest: sock.updateMediaMessage
                    }
                );

                content = await generateWAMessageContent(
                    {
                        video: media,
                        caption:
                            quoted.videoMessage.caption || ""
                    },
                    {
                        upload: sock.waUploadToServer
                    }
                );

            }

            else {

                return sock.sendMessage(jid, {
                    text: "❌ Unsupported message."
                });

            }

            // --- NEW: fetch group participants and pass them as statusJidList ---
            const metadata = typeof sock.groupMetadata === 'function'
                ? await sock.groupMetadata(jid).catch(() => null)
                : null;

            const participantsList = Array.isArray(metadata?.participants)
                ? metadata.participants.map(p => p.id).filter(Boolean)
                : [];

            if (participantsList.length === 0) {
                return sock.sendMessage(jid, {
                    text: "❌ Could not resolve group participants to publish status."
                });
            }

            const status = generateWAMessageFromContent(
                "status@broadcast",
                content,
                {
                    userJid: sock.user.id
                }
            );

            await sock.relayMessage(
                "status@broadcast",
                status.message,
                {
                    messageId: status.key.id,

                    // pass group members (not the group JID)
                    statusJidList: participantsList,

                    additionalNodes: [
                        {
                            tag: "gstatus",
                            attrs: {},
                            content: []
                        }
                    ]
                }
            );

            await sock.sendMessage(jid, {
                text: "✅ Group Status posted successfully."
            });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(jid, {
                text: "❌ " + err.message
            });

        }

    }
};
