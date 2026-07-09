const groups = require("../../lib/groups");

module.exports = {

    name: "groupinfo",

    description: "Show information about the group",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const data = await groups.metadata(sock, jid);

        const admins = data.participants.filter(p => p.admin).length;

        const text =
`📋 Group Information

📛 Name: ${data.subject}

👥 Members: ${data.participants.length}

👑 Admins: ${admins}

📝 Description:
${data.desc || "No description."}`;

        await sock.sendMessage(jid, {
            text
        });

    }

};
