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

        // Only allow .block in private chats
        if (jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.block_private_only")
            });
        }

        // WhatsApp may provide the private chat as a LID.
        // Use remoteJidAlt when it contains the phone-number JID.
        let target = jid;

        if (jid.endsWith("@lid") && msg.key.remoteJidAlt) {
            target = msg.key.remoteJidAlt;
        }

        // Safety check: make sure we have a valid user JID
        if (!target || !target.endsWith("@s.whatsapp.net")) {
            console.log("❌ INVALID BLOCK TARGET:", {
                remoteJid: jid,
                remoteJidAlt: msg.key.remoteJidAlt
            });

            return sock.sendMessage(jid, {
                text: t(jid, "owner.block_invalid")
            });
        }

        console.log("🚫 BLOCK TARGET:", target);

        try {
            await sock.updateBlockStatus(target, "block");

            await sock.sendMessage(jid, {
                text: t(jid, "owner.block_success")
            });

            console.log("✅ USER BLOCKED:", target);

        } catch (err) {
            console.error("❌ BLOCK ERROR:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "owner.block_failed")
            });
        }
    }
};
