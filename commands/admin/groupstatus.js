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
                content = { image: media, caption: quoted.imageMessage.caption || "" };
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
                content = { video: media, caption: quoted.videoMessage.caption || "" };
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

            // Try to map '@lid' -> PN addresses if possible (best-effort)
            const tryMapLIDs = async (list) => {
                if (!sock.signalRepository || !sock.signalRepository.lidMapping || typeof sock.signalRepository.lidMapping.getPNForLID !== 'function') {
                    return list;
                }
                const mapped = [];
                for (const item of list) {
                    try {
                        if (item && item.endsWith && item.endsWith('@lid')) {
                            const pn = await sock.signalRepository.lidMapping.getPNForLID(item).catch(() => null);
                            mapped.push(pn || item);
                        } else {
                            mapped.push(item);
                        }
                    } catch {
                        mapped.push(item);
                    }
                }
                return mapped;
            };

            console.log('[groupstatus] before mapping sample:', participantsList.slice(0, 10));
            const mappedParticipants = await tryMapLIDs(participantsList);
            const normalizedMapped = mappedParticipants.map(j => jidNormalizedUser(j)).filter(Boolean);
            const finalRecipients = [...new Set(normalizedMapped)].filter(p => p !== meJid);

            console.log('[groupstatus] after mapping sample:', finalRecipients.slice(0, 10));
            console.log('[groupstatus] final recipients count:', finalRecipients.length);
            console.log('[groupstatus] content type:', Boolean(content.image) ? 'image' : Boolean(content.video) ? 'video' : 'text');

            // --- temporary debug: monkey-patch sock.sendNode to capture outgoing stanza for status@broadcast ---
            const originalSendNode = sock.sendNode?.bind(sock);
            let capturedNode = null;
            if (typeof originalSendNode === 'function') {
                sock.sendNode = async (node) => {
                    try {
                        if (node && node.tag === 'message' && node.attrs && node.attrs.to === 'status@broadcast') {
                            // capture a deep copy suitable for console output
                            try {
                                capturedNode = JSON.parse(JSON.stringify(node));
                            } catch (e) {
                                capturedNode = node;
                            }
                            console.log('[groupstatus] >>> outgoing node to status@broadcast:', JSON.stringify(capturedNode, null, 2));
                        }
                    } catch (e) {
                        console.error('[groupstatus] error while logging sendNode', e);
                    }
                    return originalSendNode(node);
                };
            } else {
                console.log('[groupstatus] WARNING: sock.sendNode is not a function, cannot log outgoing stanza');
            }

            // Use sock.sendMessage (Baileys does uploads and then calls sendNode)
            await sock.sendMessage(
                "status@broadcast",
                content,
                {
                    userJid: sock.user?.id,
                    statusJidList: finalRecipients,
                    additionalNodes: [
                        { tag: "gstatus", attrs: {}, content: [] }
                    ]
                }
            );

            // restore original sendNode
            if (originalSendNode) sock.sendNode = originalSendNode;

            // If we captured the node, print abbreviated participants block and attributes so you can paste
            if (capturedNode) {
                const attrs = capturedNode.attrs || {};
                console.log('[groupstatus] captured message attrs:', attrs);
                // try to find <participants> content inside capturedNode.content (if present)
                try {
                    const participantsNode = (capturedNode.content || []).find(c => c.tag === 'participants');
                    if (participantsNode) {
                        console.log('[groupstatus] participants node (sample):', (participantsNode.content || []).slice(0, 8).map(p => p.attrs?.jid || p.attrs?.id || JSON.stringify(p.attrs)));
                    } else {
                        console.log('[groupstatus] participants node not present in captured content (check full node above)');
                    }
                } catch (e) {
                    console.log('[groupstatus] error while printing participants node', e);
                }
            } else {
                console.log('[groupstatus] no outgoing node captured (sock.sendNode missing or node logged earlier)');
            }

            await sock.sendMessage(jid, { text: "✅ Group Status posted (check logs above for outgoing stanza)." });
        } catch (err) {
            console.error('[groupstatus] error:', err);
            await sock.sendMessage(jid, { text: "❌ " + (err?.message || String(err)) });
        }
    }
};
