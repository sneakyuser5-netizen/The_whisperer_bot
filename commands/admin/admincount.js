const groups = require("../../lib/groups");

module.exports = {

    name: "admincount",

    description: "Show the number of group admins",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const members = await groups.members(sock, jid);

        const count = members.filter(m => m.admin).length;

        await sock.sendMessage(jid, {
            text: `👑 There are ${count} admin(s) in this group.`
        });

    }

};
