const messageCache = require("../lib/messageCache");
const settings = require("../lib/settings");
const { t } = require("../lib/lang");
const identity = require("../lib/identity");

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

        const groupSettings = settings.get(jid);

        if (!groupSettings?.antidelete) return;

        const sender =
            original.key.participant ||
            original.key.remoteJid;

        const displaySender = sender.replace(/@lid$/i, "");

        const text =
            original.message?.conversation ||
            original.message?.extendedTextMessage?.text ||
            "[Media message]";

        const ownerNumber = identity.getBotOwner();

        if (!ownerNumber) return;

        const owner = ownerNumber + "@s.whatsapp.net";

        let groupName = null;

        if (jid.endsWith("@g.us")) {
            try {
                const metadata = await sock.groupMetadata(jid);
                groupName = metadata.subject;
            } catch {}
        }

        const notification = [
            t(owner, "antidelete_recovered"),
            "",
            `${t(owner, "antidelete_user")}`,
            `@${displaySender}`,
            "",
            groupName
                ? `${t(owner, "antidelete_group")}\n${groupName}`
                : `${t(owner, "antidelete_chat")}\n${jid.replace(/@lid$/i, "")}`,
            "",
            `${t(owner, "antidelete_message")}`,
            text
        ].join("\n");

        await sock.sendMessage(owner, {
            text: notification,
            mentions: [sender]
        });
    }
};
