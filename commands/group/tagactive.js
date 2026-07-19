const activity = require("../../lib/activity");

module.exports = {

    name: "tagactive",

    description: "Mention recently active members",

    category: "group",

    permission: "admin",

    usage: ".tagactive [minutes]",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const minutes = parseInt(args[0]) || 30;

        const cutoff = Date.now() - (minutes * 60 * 1000);

        const metadata = await sock.groupMetadata(jid);

        let text =
`📢 Active members (last ${minutes} minute${minutes === 1 ? "" : "s"})

`;

        const mentions = [];

        for (const member of metadata.participants) {

            const id = member.id;

            const last = activity.get(jid, id);

            if (last < cutoff) continue;

            mentions.push(id);

            text += `• @${id.split("@")[0]}\n`;

        }

        if (!mentions.length) {

            return sock.sendMessage(jid, {
                text:
`😴 No members have spoken in the last ${minutes} minute${minutes === 1 ? "" : "s"}.`
            });

        }

        text += "\n😂 Wake up, everyone!";

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
