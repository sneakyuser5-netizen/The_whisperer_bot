// groupstatus.js
const {
  downloadMediaMessage,
  generateWAMessageFromContent,
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

      let participants = Array.isArray(metadata?.participants)
        ? metadata.participants.map(p => p?.id).filter(Boolean)
        : [];

      // normalize, dedupe
      participants = participants.map(j => jidNormalizedUser(j));
      participants = [...new Set(participants)];

      // exclude ourselves
      const meJid = jidNormalizedUser(sock.user?.id);
      participants = participants.filter(p => p !== meJid);

      if (participants.length === 0) {
        return sock.sendMessage(jid, {
          text: "❌ Could not resolve group participants to publish status."
        });
      }

      // Try LID -> PN mapping if available (best-effort)
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

      const mapped = await tryMapLIDs(participants);
      let finalPNs = mapped.map(j => jidNormalizedUser(j)).filter(Boolean);
      finalPNs = [...new Set(finalPNs)].filter(p => p !== meJid);

      if (finalPNs.length === 0) {
        return sock.sendMessage(jid, {
          text: "❌ After mapping there are no valid recipients to publish status to."
        });
      }

      // Also build explicit device-addressed JIDs for participants (device 0)
      const participantsDeviceJids = finalPNs.map(p => {
        try {
          const dec = jidDecode(p);
          if (!dec?.user) return null;
          const server = dec.server || 's.whatsapp.net';
          return jidEncode(dec.user, server, 0); // explicit device 0
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Build the status message using generateWAMessageFromContent so keys/ids are created correctly
      const status = generateWAMessageFromContent(
        "status@broadcast",
        content,
        { userJid: sock.user?.id }
      );

      // Build participants node (items) — server expects a <participants> list node
      const participantsNodeItems = participantsDeviceJids.map(j => ({
        tag: 'item',
        attrs: { jid: j }
      }));

      // add a small console debug so you can paste it if it still fails
      console.log('[groupstatus] finalPNs count:', finalPNs.length);
      console.log('[groupstatus] sample finalPNs:', finalPNs.slice(0, 8));
      console.log('[groupstatus] sample device-jids:', participantsDeviceJids.slice(0, 8));
      console.log('[groupstatus] content type:', Boolean(content.image) ? 'image' : Boolean(content.video) ? 'video' : 'text');
      console.log('[groupstatus] about to relay status@broadcast id=', status.key?.id);

      // Relay explicitly with participants node & addressing_mode set to 'pn'
      await sock.relayMessage(
        "status@broadcast",
        status.message,
        {
          messageId: status.key.id,
          // give the PN user list as statusJidList (server uses this for 1:1 routing)
          statusJidList: finalPNs,
          // ensure addressing mode leans toward PN addresses
          additionalAttributes: {
            addressing_mode: 'pn'
          },
          // include participants node explicitly and gstatus node
          additionalNodes: [
            {
              tag: 'participants',
              attrs: {},
              content: participantsNodeItems
            },
            {
              tag: "gstatus",
              attrs: {},
              content: []
            }
          ]
        }
      );

      await sock.sendMessage(jid, { text: "✅ Group Status posted (check members' Status tab)." });
    } catch (err) {
      console.error('[groupstatus] error:', err);
      await sock.sendMessage(jid, { text: "❌ " + (err?.message || String(err)) });
    }
  }
};
