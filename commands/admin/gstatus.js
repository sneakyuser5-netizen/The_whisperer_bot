const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { t } = require("../../lib/lang");
case 'gstatus': {
    if (!isGroup) return reply(t(jid, "admin.only_groups"))
    if (!isAdmins) return reply(t(jid, "admin.not_admin"))
    
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply(t(jid, "admin.gstatus_reply_media"))

    const groupMetadata = await sock.groupMetadata(jid);
    const members = groupMetadata.participants.map(p => p.id);

    let content = {};
    if (quoted.imageMessage) {
        const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
        content = { image: buffer, caption: quoted.imageMessage.caption || "" };
    } else if (quoted.videoMessage) {
        const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
        content = { video: buffer, caption: quoted.videoMessage.caption || "" };
    } else return reply(t(jid, "admin.gstatus_only_supported"))

    // 1. Send to group and tag everyone
    const sentMsg = await sock.sendMessage(jid, {
        ...content,
        mentions: members,
        caption: `📢 *GROUP STATUS* 📢\n\n${content.caption}\n\n@everyone`
    });

    // 2. Pin the message for 24h so it's at the top like a status
    await sock.chatModify({ pin: true }, jid).catch(()=>{});
    
    reply(`✅ Posted to group and pinned. All ${members.length} members notified.`)
}
break
