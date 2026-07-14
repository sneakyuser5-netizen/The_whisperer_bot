module.exports = {
    
    name: "antilink",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

    if (!msg.message) return;

    const jid = msg.key.remoteJid;
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


    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";


    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

    if (!linkRegex.test(text)) return;


    try {

        // Get group info
        const metadata = await sock.groupMetadata(jid);

console.log(
    JSON.stringify(
        metadata.participants,
        null,
        2
    )
);

const sender = msg.key.participant || msg.key.remoteJid;

const member = metadata.participants.find(p => {
    const id = (p.id || p.jid || "").split(":")[0];
    const phone = (p.phoneNumber || "").split(":")[0];
    const user = sender.split(":")[0];

    return id === user || phone === user;
});

console.log("Sender:", sender);
console.log("Member:", member);

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
