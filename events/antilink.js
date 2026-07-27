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

// Use the original participant JID from WhatsApp
const sender = msg.key.participant || msg.key.remoteJid;

const member = metadata.participants.find(p => {
    return (p.id || p.jid) === sender;
});

// Ignore admins and group owner
if (member && member.admin) return;

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
