const groups = require("../../lib/groups");
module.exports = {

    name: "demote",

    description: "Remove admin status from a member",

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
                text: "❌ Reply to an admin or mention them.\n\nExample:\n.demote @user"
            });
        }

        try {

            await groups.demote(
    sock,
    jid,
    target
);

            await sock.sendMessage(jid, {
                text: "✅ User removed from admin list."
            });

        } catch (err) {

            console.log("Demote error:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to demote user."
            });
        }

    }
};
