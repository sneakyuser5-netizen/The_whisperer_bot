const warns = require("../../lib/warns");

module.exports = {

    name: "warnlist",

    description: "Show all warned users",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const list = warns.list(jid);

        let text = "📋 Warning List\n\n";
        let found = false;

        for (const member of list) {

    if (member.warns <= 0) continue;

    found = true;

    text += `• @${member.user.split("@")[0]} - ${member.warns}/3\n`;

        }

        if (!found) {
            text = "✅ No users currently have warnings.";
        }

        await sock.sendMessage(jid, {
            text,
            mentions: found
    ? list.map(member => member.user)
    : []
        });

    }

};
