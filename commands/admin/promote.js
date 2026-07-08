const groups = require("../../lib/groups");
module.exports = {

    name: "promote",

    description: "Promote a member to admin",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const context = msg.message?.extendedTextMessage?.contextInfo;

        let target = context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: "❌ Reply to a user or mention them.\n\nExample:\n.promote @user"
            });
        }

        try {

            await groups.promote(
    sock,
    jid,
    target
);

            await sock.sendMessage(jid, {
                text: "✅ User promoted to admin."
            });

        } catch (err) {

            console.log("Promote error:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to promote user."
            });
        }

    }
};
