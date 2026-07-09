const groups = require("../../lib/groups");

module.exports = {

    name: "membercount",

    description: "Show the number of group members",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const members = await groups.members(sock, jid);

        await sock.sendMessage(jid, {
            text: `👥 Total members: ${members.length}`
        });

    }

};
