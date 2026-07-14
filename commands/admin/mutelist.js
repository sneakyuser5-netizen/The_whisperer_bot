const mute = require("../../lib/mute");

module.exports = {

    name: "mutelist",

    description: "Show muted members",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const list = mute.list(jid);

        const users = Object.entries(list);

        if (!users.length) {
            return sock.sendMessage(jid, {
                text: "🔊 No members are currently muted."
            });
        }

        let text = "🔇 *Muted Members*\n\n";
        const mentions = [];

        for (const [user, data] of users) {

            const left = Math.max(
                0,
                data.until - Date.now()
            );

            const mins = Math.floor(left / 60000);
            const secs = Math.floor((left % 60000) / 1000);

            text += `• @${user.split("@")[0]} — ${mins}m ${secs}s\n`;

            mentions.push(user);

        }

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
