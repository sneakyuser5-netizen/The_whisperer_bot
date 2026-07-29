const {
    generateWAMessageContent,
    generateWAMessageFromContent,
    downloadMediaMessage,
    jidDecode,
    jidEncode
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

            // fetch group metadata to build participants list
            const metadata = typeof sock.groupMetadata === 'function'
                ? await sock.groupMetadata(jid).catch(() => null)
                : null;

            const participants = Array.isArray(metadata?.participants)
                ? metadata.participants.map(p => p.id).filter(Boolean)
                : [];

            if (participants.length === 0) {
                return sock.sendMessage(jid, {
                    text: "❌ Could not resolve group participants to publish status."
                });
            }

            // Build explicit device JIDs for each participant (device 0)
            const participantsDevices = participants
                .map(p => {
                    try {
                        const decoded = jidDecode(p);
                        if (!decoded?.user) return null;
                        const server = decoded.server || 's.whatsapp.net';
                        return jidEncode(decoded.user, server, 0);
                    }
                    catch {
                        return null;
                    }
                })
                .filter(Boolean);

            if (participantsDevices.length === 0) {
                return sock.sendMessage(jid, {
                    text: "❌ Could not build participant device JIDs."
                });
            }

            // Send via sock.sendMessage so Baileys runs the full send flow
            await sock.sendMessage(
                "status@broadcast",
                content,
                {
                    userJid: sock.user?.id,
                    statusJidList: participantsDevices,
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
                text: "❌ " + (err?.message || String(err))
            });

        }

    }
};
