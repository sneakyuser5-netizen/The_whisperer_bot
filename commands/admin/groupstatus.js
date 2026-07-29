const {
    downloadMediaMessage,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

module.exports = {
    name: "groupstatus",
    category: "admin",
    description: "Post a WhatsApp Group Status",
    permission: "admin",

    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;
        const context = msg.message?.extendedTextMessage?.contextInfo;

        if (!context?.quotedMessage) {
            return sock.sendMessage(jid, { text: "❌ Reply to an image, video or text." });
        }

        const quoted = context.quotedMessage;

        try {
            let content;

            // TEXT
            if (quoted.conversation || quoted.extendedTextMessage) {
                content = {
                    text: quoted.conversation || quoted.extendedTextMessage.text
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

                content = {
                    image: media,
                    caption: quoted.imageMessage.caption || ""
                };
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

                content = {
                    video: media,
                    caption: quoted.videoMessage.caption || ""
                };
            }
            else {
                return sock.sendMessage(jid, { text: "❌ Unsupported message." });
            }

            // fetch group metadata to build participants list (members' user JIDs)
            const metadata = typeof sock.groupMetadata === "function"
                ? await sock.groupMetadata(jid).catch(() => null)
                : null;

            let participantsList = Array.isArray(metadata?.participants)
                ? metadata.participants.map(p => p?.id).filter(Boolean)
                : [];

            // Normalize participant user JIDs and remove duplicates
            participantsList = participantsList.map(j => jidNormalizedUser(j));
            participantsList = [...new Set(participantsList)];

            // Exclude ourselves (the bot account) from the recipients list
            const meJid = jidNormalizedUser(sock.user?.id);
            participantsList = participantsList.filter(p => p !== meJid);

            if (participantsList.length === 0) {
                return sock.sendMessage(jid, {
                    text: "❌ Could not resolve group participants to publish status (no recipients after filtering)."
                });
            }

            // Debug logging — will print to your console
            console.log('[groupstatus] sending status@broadcast');
            console.log('[groupstatus] participants count:', participantsList.length);
            console.log('[groupstatus] sample participants:', participantsList.slice(0, 6));
            console.log('[groupstatus] content type:', Boolean(content.image) ? 'image' : Boolean(content.video) ? 'video' : 'text');

            // Send via sock.sendMessage so Baileys runs the full send flow (uploads, tokens, etc.)
            await sock.sendMessage(
                "status@broadcast",
                content,
                {
                    userJid: sock.user?.id,
                    // members' normalized user JIDs
                    statusJidList: participantsList,
                    additionalNodes: [
                        { tag: "gstatus", attrs: {}, content: [] }
                    ]
                }
            );

            await sock.sendMessage(jid, { text: "✅ Group Status posted successfully." });
        } catch (err) {
            console.error('[groupstatus] error:', err);
            await sock.sendMessage(jid, { text: "❌ " + (

