module.exports = {
    name: "antilink",
    trigger: "messages.upsert",

    execute: async (sock, msg) => {
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const settingsLib = require("../lib/settings");
        const groupSettings = settingsLib.get(jid);
        const fs = require("fs");
        const path = require("path");
        const identity = require("../lib/identity");
        const settingsFile = path.join(__dirname, "../database/settings.json");

        let settings = {};
        try {
            settings = JSON.parse(fs.readFileSync(settingsFile));
        } catch {
            settings = {};
        }

        if (!settings[jid]?.antilink) return;
        if (!jid.endsWith("@g.us")) return;

        // Sticker lock
        if (groupSettings.lock_sticker && msg.message?.stickerMessage) {
            const metadata = await sock.groupMetadata(jid);

            const sender = msg.key.participant || msg.key.remoteJid;

            const member = metadata.participants.find(p => {
                return (p.id || p.jid) === sender;
            });

            if (!member?.admin) {
                await sock.sendMessage(jid, { delete: msg.key });

                return sock.sendMessage(jid, {
                    text: "🚫 Stickers are currently locked."
                });
            }
        }

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            "";

        const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

        if (!linkRegex.test(text)) return;

        try {
            const metadata = await sock.groupMetadata(jid);

            const sender = msg.key.participant || msg.key.remoteJid;

            const member = metadata.participants.find(p => {
                return (p.id || p.jid) === sender;
            });

// Ignore group admins, bot owner, creator and sudo users
if (
    member?.admin ||
    identity.isBotOwner(msg) ||
    identity.isCreator(msg) ||
    identity.isSudo(msg)
) {
    return;
}

            await sock.sendMessage(jid, { delete: msg.key });

            await sock.sendMessage(jid, {
                text: `🚫 Anti-link activated!\n\n@${sender.split("@")[0]}, links are not allowed here.`,
                mentions: [sender]
            });

        } catch (err) {
            console.log("Anti-link error:", err);
        }
    }
};
