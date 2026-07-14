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

    // Only groups
    if (!jid.endsWith("@g.us")) return;
// Sticker lock
if (
    groupSettings.lock_sticker &&
    msg.message?.stickerMessage
) {
    const metadata =
        await sock.groupMetadata(jid);

    const sender =
        msg.key.participant;

    const member =
        metadata.participants.find(p => {

            const id =
                (p.id || p.jid || "")
                .split(":")[0];

            return id ===
                sender.split(":")[0];

        });

    if (!member?.admin) {

        await sock.sendMessage(jid, {
            delete: msg.key
        });

        return sock.sendMessage(jid, {
            text:
                "🚫 Stickers are currently locked."
        });

    }

}

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";


    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

    if (!linkRegex.test(text)) return;


    try {

        // Get group info
        const metadata = await sock.groupMetadata(jid);

const sender = msg.key.participant || msg.key.remoteJid;

const member = metadata.participants.find(p => {
    const id = (p.id || p.jid || "").split(":")[0];
    const phone = (p.phoneNumber || "").split(":")[0];
    const user = sender.split(":")[0];

    return id === user || phone === user;
});

// Ignore admins
if (member && member.admin) return;
        
        await sock.sendMessage(jid, {
            delete: msg.key
        });


        await sock.sendMessage(jid, {
            text:
`🚫 Anti-link activated!

@${sender.split("@")[0]}, links are not allowed here.`,
            mentions: [sender]
        });


    } catch (err) {

        console.log("Anti-link error:", err);

    }

}
};
