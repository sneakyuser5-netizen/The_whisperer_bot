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
      // build content
      let content;
      if (quoted.conversation || quoted.extendedTextMessage) {
        content = { text: quoted.conversation || quoted.extendedTextMessage.text };
      } else if (quoted.imageMessage) {
        const media = await downloadMediaMessage(
          {
            key: { remoteJid: jid, id: context.stanzaId, participant: context.participant },
            message: quoted
          },
          "buffer",
          {},
          { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
        );
        content = { image: media, caption: quoted.imageMessage.caption || "" };
      } else if (quoted.videoMessage) {
        const media = await downloadMediaMessage(
          {
            key: { remoteJid: jid, id: context.stanzaId, participant: context.participant },
            message: quoted
          },
          "buffer",
          {},
          { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
        );
        content = { video: media, caption: quoted.videoMessage.caption || "" };
      } else {
        return sock.sendMessage(jid, { text: "❌ Unsupported message type (reply to text/image/video)." });
      }

      // fetch group metadata and build participants list
      const metadata = typeof sock.groupMetadata === "function"
        ? await sock.groupMetadata(jid).catch(() => null)
        : null;

      let participants = Array.isArray(metadata?.participants)
        ? metadata.participants.map(p => p?.id).filter(Boolean)
        : [];

      participants = participants.map(j => jidNormalizedUser(j));
      participants = [...new Set(participants)];
      const meJid = jidNormalizedUser(sock.user?.id);
      participants = participants.filter(p => p && p !== meJid);

      if (participants.length === 0) {
        return sock.sendMessage(jid, { text: "❌ No valid group participants found to publish status to." });
      }

      // best-effort LID -> PN mapping
      const tryMapLIDs = async (list) => {
        if (!sock.signalRepository || !sock.signalRepository.lidMapping || typeof sock.signalRepository.lidMapping.getPNForLID !== 'function') {
          return list;
        }
        const out = [];
        for (const x of list) {
          try {
            if (typeof x === 'string' && x.endsWith('@lid')) {
              const pn = await sock.signalRepository.lidMapping.getPNForLID(x).catch(() => null);
              out.push(pn || x);
            } else out.push(x);
          } catch {
            out.push(x);
          }
        }
        return out;
      };

      const mapped = await tryMapLIDs(participants);
      let finalPNs = mapped.map(j => jidNormalizedUser(j)).filter(Boolean);
      finalPNs = [...new Set(finalPNs)].filter(p => p !== meJid);

      if (finalPNs.length === 0) {
        return sock.sendMessage(jid, { text: "❌ After mapping, no valid PN recipients available." });
      }

      // explicit device-addressed jids (device 0)
      const deviceJids = finalPNs.map(p => {
        try {
          const dec = jidDecode(p);
          if (!dec?.user) return null;
          const server = dec.server || 's.whatsapp.net';
          return jidEncode(dec.user, server, 0);
        } catch {
          return null;
        }
      }).filter(Boolean);

      // create status message
      const status = generateWAMessageFromContent("status@broadcast", content, { userJid: sock.user?.id });
      const msgId = status.key?.id;

      // participants node content (deduped)
      const participantsNodeContent = [
        ...finalPNs.map(p => ({ tag: 'item', attrs: { jid: p } })),
        ...deviceJids.map(d => ({ tag: 'item', attrs: { jid: d } }))
      ];
      const seen = new Set();
      const dedupedParticipants = [];
      for (const it of participantsNodeContent) {
        const j = it?.attrs?.jid;
        if (!j) continue;
        if (!seen.has(j)) {
          seen.add(j);
          dedupedParticipants.push(it);
        }
      }

      // minimal logging: recipients count + small sample
      console.log('[groupstatus] recipients:', finalPNs.length, 'sample:', finalPNs.slice(0, 6));

      // relay message with addressing_mode hint and explicit participants node
      console.log('[groupstatus] relaying id=', msgId, 'participants=', dedupedParticipants.length);
      await sock.relayMessage(
        "status@broadcast",
        status.message,
        {
          messageId: msgId,
          statusJidList: finalPNs,
          additionalAttributes: { addressing_mode: 'pn' },
          additionalNodes: [
            { tag: 'participants', attrs: {}, content: dedupedParticipants },
            { tag: 'gstatus', attrs: {}, content: [] }
          ]
        }
      );

      await sock.sendMessage(jid, { text: "✅ Attempted group status broadcast." });
    } catch (err) {
      console.error('[groupstatus] error:', err?.message || String(err));
      await sock.sendMessage(jid, { text: "❌ " + (err?.message || String(err)) });
    }
  }
};
