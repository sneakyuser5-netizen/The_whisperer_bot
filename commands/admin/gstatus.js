const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { t } = require("../../lib/lang");

module.exports = {
    name: "gstatus",
    description: t("en", "gstatus"),
    category: "admin",
    permission: "admin",
    
    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || jid;

        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(jid, { text: t(jid, "admin.only_groups") });
        }

        const groupMetadata = await sock.groupMetadata(jid);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (!isAdmin) return sock.sendMessage(jid, { text: t(jid, "admin.not_admin") });

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return sock.sendMessage(jid, { text: t(jid, "admin.gstatus_reply_media") });

        const members = groupMetadata.participants.map(p => p.id);
        let content = {};
        if (quoted.imageMessage) {
            const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
            content = { image: buffer, caption: quoted.imageMessage.caption || "" };
        } else if (quoted.videoMessage) {
            const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
            content = { video: buffer, caption: quoted.videoMessage.caption || "" };
        } else return sock.sendMessage(jid, { text: t(jid, "admin.gstatus_only_supported") });

        await sock.sendMessage(jid, { ...content, mentions: members, caption: `📢 *GROUP STATUS* 📢\n\n${content.caption}\n\n@everyone` });
        await sock.chatModify({ pin: true }, jid).catch(() => {});
        await sock.sendMessage(jid, { text: `✅ Posted to group and pinned. All ${members.length} members notified.` });
    }
};
