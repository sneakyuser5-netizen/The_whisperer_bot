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

            console.log('[groupstatus] before mapping sample:', participantsList.slice(0, 12));
            const mappedParticipants = await tryMapLIDs(participantsList);
            const normalizedMapped = mappedParticipants.map(j => jidNormalizedUser(j)).filter(Boolean);
            const finalRecipients = [...new Set(normalizedMapped)].filter(p => p !== meJid);

            console.log('[groupstatus] after mapping sample:', finalRecipients.slice(0, 12));
            console.log('[groupstatus] final recipients count:', finalRecipients.length);
            console.log('[groupstatus] content type:', Boolean(content.image) ? 'image' : Boolean(content.video) ? 'video' : 'text');

            // --- Debugging: wrap sock.sendNode to capture outgoing stanza to status@broadcast ---
            const origSendNode = sock.sendNode?.bind(sock);
            let capturedNode = null;
            let sendNodeError = null;
            if (typeof origSendNode === 'function') {
                sock.sendNode = async (node) => {
                    try {
                        // capture deep copy safely
                        if (node && node.tag === 'message' && node.attrs && node.attrs.to === 'status@broadcast') {
                            try {
                                capturedNode = JSON.parse(JSON.stringify(node));
                            } catch (e) {
                                capturedNode = node;
                            }
                            console.log('[groupstatus] >>> captured outgoing node to status@broadcast (truncated):');
                            // print only some keys first to keep console manageable
                            try {
                                const small = {
                                    attrs: capturedNode.attrs,
                                    contentSummary: (capturedNode.content || []).slice(0, 6).map(c => {
                                        if (!c) return c;
                                        return { tag: c.tag, attrs: c.attrs ? Object.keys(c.attrs) : undefined, contentSample: typeof c.content === 'string' ? '[string]' : Array.isArray(c.content) ? (c.content.length ? (c.content[0].attrs || c.content[0]) : []) : c.content };
                                    })
                                };
                                console.log(JSON.stringify(small, null, 2));
                            } catch (e) {
                                console.log('failed to print small summary of node', e);
                            }
                            // print full node as JSON (if not too large)
                            try {
                                console.log('[groupstatus] >>> full node JSON start >>>');
                                console.log(JSON.stringify(capturedNode, null, 2));
                                console.log('[groupstatus] >>> full node JSON end >>>');
                            } catch (e) {
                                console.log('[groupstatus] full node JSON serialization failed:', e);
                            }
                        }
                    } catch (e) {
                        console.error('[groupstatus] error while logging sendNode', e);
                    }
                    return origSendNode(node).catch(err => {
                        sendNodeError = err;
                        throw err;
                    });
                };
            } else {
                console.log('[groupstatus] WARNING: sock.sendNode is not a function, cannot capture outgoing stanza');
            }

            // now call sendMessage (Baileys will call sendNode internally)
            let sendResult = null;
            try {
                sendResult = await sock.sendMessage(
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
                console.log('[groupstatus] sendMessage result:', sendResult && sendResult.key ? sendResult.key : sendResult);
            } catch (err) {
                console.error('[groupstatus] sendMessage threw:', err);
                throw err;
            } finally {
                // restore original sendNode
                if (origSendNode) sock.sendNode = origSendNode;
            }

            // print captured node summary again for clarity
            if (capturedNode) {
                try {
                    // look for participants node inside content
                    const participantsNode = (capturedNode.content || []).find(c => c && c.tag === 'participants');
                    if (participantsNode) {
                        const pJids = (participantsNode.content || []).slice(0, 30).map(p => p.attrs?.jid || p.attrs?.id || JSON.stringify(p.attrs)).filter(Boolean);
                        console.log('[groupstatus] participants included in outgoing node (sample):', pJids.slice(0, 12));
                    } else {
                        console.log('[groupstatus] participants node NOT found inside captured outgoing node content');
                    }
                } catch (e) {
                    console.log('[groupstatus] failed to inspect captured node:', e);
                }
            } else {
                console.log('[groupstatus] no outgoing node was captured (sendNode may not have been called or patch failed)');
                if (sendNodeError) console.error('[groupstatus] sendNode reported error:', sendNodeError);
            }

            await sock.sendMessage(jid, { text: "✅ Group Status posted (see console logs for outgoing node and participants)." });
        } catch (err) {
            console.error('[groupstatus] error:', err);
            await sock.sendMessage(jid, { text: "❌ " + (err?.message || String(err)) });
        }
    }
};
