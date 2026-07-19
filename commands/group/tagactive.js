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

        const minutes = Math.max(
            parseInt(args[0]) || 30,
            1
        );

        const cutoff =
            Date.now() - (minutes * 60 * 1000);

        const metadata =
            await sock.groupMetadata(jid);

        const active = [];

        for (const member of metadata.participants) {

            const id = member.id;

            const last =
                activity.get(jid, id);

            if (last < cutoff) continue;

            active.push({
                id,
                last
            });

        }

        if (!active.length) {

            return sock.sendMessage(jid, {
                text:
`😴 Nobody has spoken in the last ${minutes} minute${minutes === 1 ? "" : "s"}.`
            });

        }

        active.sort((a, b) => b.last - a.last);

        let text =
`📢 Active Members

🕒 Last ${minutes} minute${minutes === 1 ? "" : "s"}

👥 Total: ${active.length}

`;

        const mentions = [];

        active.forEach((user, index) => {

            mentions.push(user.id);

            text += `${index + 1}. @${user.id.split("@")[0]}\n`;

        });

        text += "\n🔥 These members have been active recently.";

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
