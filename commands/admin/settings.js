const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../database/settings.json");

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

        let settings = {};

        try {

            settings = JSON.parse(
                fs.readFileSync(file)
            );

        } catch {

            settings = {};

        }

        const group = settings[jid] || {};

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
