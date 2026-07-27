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
            const sender = msg.key.participant;
            const member = metadata.participants.find(p => {
                const id = (p.id || p.jid || "").split(":")[0];
                return id === sender.split(":")[0];
            });

            if (!member?.admin &&!member?.superadmin) { // FIX 1: check superadmin too
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
                const id = (p.id || p.jid || "").split(":")[0];
                return id === sender.split(":")[0];
            });

            // FIX 1: Ignore admins and superadmins
            if (member?.admin || member?.superadmin) return;

            await sock.sendMessage(jid, { delete: msg.key });

            // FIX 2: Force correct JID for mention
            const mentionJid = sender.includes("@s.whatsapp.net")? sender : sender.split("@")[0] + "@s.whatsapp.net";
            const name = mentionJid.split("@")[0];

            await sock.sendMessage(jid, {
                text: `🚫 Anti-link activated!\n\n@${name}, links are not allowed here.`,
                mentions: [mentionJid] // THIS makes it show name and ping
            });

        } catch (err) {
            console.log("Anti-link error:", err);
        }
    }
};
