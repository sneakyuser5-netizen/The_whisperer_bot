const { t } = require("../../lib/lang");

module.exports = {
    name: "block",
    description: "Block the user in the current private chat",
    category: "owner",
    permission: "owner",
    usage: ".block",
    minArgs: 0,

    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        // Block command only works in private chats
        if (jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.block_private_only")
            });
        }

        // Don't allow blocking the bot itself
        if (msg.key.fromMe) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.block_invalid")
            });
        }

        try {
            await sock.updateBlockStatus(jid, "block");

            await sock.sendMessage(jid, {
                text: t(jid, "owner.block_success")
            });

        } catch (err) {
            console.error("BLOCK ERROR:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "owner.block_failed")
            });
        }
    }
};
