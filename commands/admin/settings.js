const settings = require("../../lib/settings");

module.exports = {

    name: "settings",

    description: "Show current group settings",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const group = settings.get(jid);

        await sock.sendMessage(jid, {

            text:
`📋 WhispererBot Settings

🛡 Anti-Link : ${group.antilink ? "✅ ON" : "❌ OFF"}

👋 Welcome : ${group.welcome ? "✅ ON" : "❌ OFF"}

🚫 Anti-GM : ${group.antigm ? "✅ ON" : "❌ OFF"}

👋 Goodbye : ${group.goodbye ? "✅ ON" : "❌ OFF"}`

        });

    }

};
