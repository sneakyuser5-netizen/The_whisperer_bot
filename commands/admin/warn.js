const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../database/warns.json");

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


        let warns = JSON.parse(fs.readFileSync(file));

        const key = `${jid}_${target}`;

        warns[key] = (warns[key] || 0) + 1;

        fs.writeFileSync(
            file,
            JSON.stringify(warns, null, 2)
        );


        await sock.sendMessage(jid, {
            text:
`⚠️ Warning issued

User: @${target.split("@")[0]}
Warnings: ${warns[key]}/3`,
            mentions: [target]
        });


        if (warns[key] >= 3) {

            await sock.sendMessage(jid, {
                text: "🚨 User reached 3 warnings. Removing member."
            });

            await sock.groupParticipantsUpdate(
                jid,
                [target],
                "remove"
            );

            warns[key] = 0;

            fs.writeFileSync(
                file,
                JSON.stringify(warns, null, 2)
            );
        }

    }
};