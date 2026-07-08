const warns = require("../../lib/warns");

module.exports = {

    name: "warn",

    description: "Warn a group member",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        // continue with the rest of your code...






        const context = msg.message?.extendedTextMessage?.contextInfo;

        let target = context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: "❌ Reply to a user or mention them.\n\nExample:\n.warn @user"
            });
        }


        const count = warns.add(jid, target);


        await sock.sendMessage(jid, {
            text:
`⚠️ Warning issued

User: @${target.split("@")[0]}
Warnings: ${count}/3
            mentions: [target]
        });


        if (count >= 3) {

            await sock.sendMessage(jid, {
                text: "🚨 User reached 3 warnings. Removing member."
            });

            await sock.groupParticipantsUpdate(
                jid,
                [target],
                "remove"
            );

            warns.reset(jid, target);
        }

    }
};
