const groups = require("../../lib/groups");

module.exports = {

    name: "tagadmins",

    description: "Mention all group admins",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const members = await groups.members(sock, jid);
        const admins = members.filter(m => m.admin);

        let text = "👑 Group Admins\n\n";
        const mentions = [];

        for (const admin of admins) {

            mentions.push(admin.id);

            text += `• @${admin.id.split("@")[0]}\n`;

        }

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
