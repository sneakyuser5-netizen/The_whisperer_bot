const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../database/warns.json");

module.exports = {

    name: "warnings",

    description: "Check a user's warnings",

    category: "admin",

    permission: "admin",

    usage: ".warnings @user",

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
                text: "❌ Reply to a user or mention them.\n\nExample:\n.warnings @user"
            });
        }

        let warns = {};

        try {
            warns = JSON.parse(fs.readFileSync(file));
        } catch {
            warns = {};
        }

        const key = `${jid}_${target}`;
        const count = warns[key] || 0;

        await sock.sendMessage(jid, {
            text:
`📋 Warning Status

User: @${target.split("@")[0]}
Warnings: ${count}/3`,
            mentions: [target]
        });

    }

};
