const messageCache = require("../lib/messageCache");
const settings = require("../lib/settings");

module.exports = {

    name: "antidelete",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        if (!msg.message) return;

        const protocol = msg.message.protocolMessage;

        if (!protocol) return;
        

        // Only handle deleted messages
        if (protocol.type !== 0) return;

        const deletedId = protocol.key?.id;

        if (!deletedId) return;

        const original = messageCache.get(deletedId);

        if (!original) return;

        const jid = original.key.remoteJid;

        // Only groups for now
        if (!jid.endsWith("@g.us")) return;

        const groupSettings = settings.get(jid);

        if (!groupSettings?.antidelete) return;

        const sender = original.key.participant || original.key.remoteJid;

        const text =
            original.message?.conversation ||
            original.message?.extendedTextMessage?.text ||
            "[Media message]";

        const identity = require("../lib/identity");

const owner = identity.getBotOwner();

if (!owner) return;
        const owner = identity.getBotOwner();

if (!owner) return;

let groupName = "Unknown Group";

try {
    const metadata = await sock.groupMetadata(jid);
    groupName = metadata.subject;
} catch {}

        await sock.sendMessage(owner, {
            text:
`🗑️ Deleted Message Recovered

👤 User:
@${sender}

👥 Group:
${groupName}

💬 Message:
${text}`,
            mentions: [sender]
        });

    }

};
