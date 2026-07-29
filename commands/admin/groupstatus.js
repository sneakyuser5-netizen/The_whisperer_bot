const {
    downloadMediaMessage,
    jidDecode,
    jidEncode,
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
                content = { text: quoted.conversation || quoted.extendedTextMessage.text };
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
            } else {
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

            // Try to translate @lid addresses to PN addresses using sock.signalRepository.lidMapping.getPNForLID if available.
            // This is best-effort: if the mapping function doesn't exist or fails, we fall back to the original jid.
            const tryMapLIDs = async (list) => {
                if (!sock.signalRepository || !sock.signalRepository.lidMapping || typeof sock.signalRepository.lidMapping.getPNForLID !== 'function') {
                    return list;
                }
                const mapped = [];
                for (const item of list) {
                    try {
                        // only attempt mapping for @lid addresses
                        if (item && item.endsWith && item.endsWith('@lid')) {
                            // getPNForLID might accept either full jid or user; we pass the full jid
                            const pn = await sock.signalRepository.lidMapping.getPNForLID(item).catch(() => null);
                            mapped.push(pn || item);
                        } else {
                            mapped.push(item);
                        }
                    } catch (e) {
                        mapped.push(item);
                    }
                }
                return mapped;
            };

            console.log('[groupstatus] before mapping sample:', participantsList.slice(0, 6));
            const mappedParticipants = await tryMapLIDs(participantsList);
            // normalize mapped results (in case mapping returned undefined / different format)
            const normalizedMapped = mappedParticipants.map(j => jidNormalizedUser(j)).filter(Boolean);
            const finalRecipients = [...new Set(normalizedMapped)].filter(p => p !== meJid);

            console.log('[groupstatus] after mapping sample:', finalRecipients.slice(0, 6));
            console.log('[groupstatus] final recipients count:', finalRecipients.length);
            console.log('[groupstatus] content type:', Boolean(content.image) ? 'image' : Boolean(content.video) ? 'video' : 'text');

            if (finalRecipients.length === 0) {
                return sock.sendMessage(jid, {
                    text: "❌ After LID→PN mapping there were no valid recipients to publish status to."
                });
            }

            // Send via sock.sendMessage so Baileys runs the full send flow (uploads, tokens, etc.)
            await sock.sendMessage(
                "status@broadcast",
                content,
                {
                    userJid: sock.user?.id,
                    // Important: pass members (mapped to PN where possible)
                    statusJidList: finalRecipients,
                    additionalNodes: [
                        { tag: "gstatus", attrs: {}, content: [] }
                    ]
                }
            );

            await sock.sendMessage(jid, { text: "✅ Group Status posted successfully." });
        } catch (err) {
            console.error('[groupstatus] error:', err);
            await sock.sendMessage(jid, { text: "❌ " + (err?.message || String(err)) });
        }
    }
};
