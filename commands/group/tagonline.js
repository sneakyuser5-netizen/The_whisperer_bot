const presence = require("../../lib/presence");

module.exports = {

    name: "tagonline",

    description: "Mention members who are currently online",

    category: "group",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const metadata = await sock.groupMetadata(jid);

        const mentions = [];

        let text = "🟢 *Online Members*\n\n";

        for (const member of metadata.participants) {

            const id = member.id;

            if (!presence.has(id)) continue;

            mentions.push(id);

            text += `• @${id.split("@")[0]}\n`;

        }

        if (!mentions.length) {

            return sock.sendMessage(jid, {
                text: "😴 Nobody appears to be online right now."
            });

        }

        text += "\n📢 Roll call complete!";

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
