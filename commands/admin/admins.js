const groups = require("../../lib/groups");

module.exports = {

    name: "admins",

    description: "Show all group admins",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const members = await groups.members(sock, jid);

        const admins = members.filter(member => member.admin);

        let text = "👑 *Group Admins*\n\n";
        const mentions = [];

        for (const admin of admins) {

            const user = admin.id || admin.jid;

            mentions.push(user);

            text += `• @${user.split("@")[0]}\n`;

        }

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
