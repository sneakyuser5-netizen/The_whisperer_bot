const warns = require("../../lib/warns");

module.exports = {

    name: "resetwarn",

    description: "Reset a user's warnings",

    category: "admin",

    permission: "admin",

    usage: ".resetwarn @user",

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
                text: "❌ Reply to a user or mention them."
            });
        }

        warns.reset(jid, target);

        await sock.sendMessage(jid, {
            text:
`✅ Warnings reset.

User: @${target.split("@")[0]}
Warnings: 0/3`,
            mentions: [target]
        });

    }

};
