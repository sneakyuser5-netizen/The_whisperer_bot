const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../database/warns.json");

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

        let warns = {};

        try {
            warns = JSON.parse(fs.readFileSync(file));
        } catch {
            warns = {};
        }

        let text = "📋 Warning List\n\n";
        let found = false;

        for (const key in warns) {

            if (!key.startsWith(jid + "_")) continue;

            const count = warns[key];

            if (count <= 0) continue;

            found = true;

            const user = key.split("_")[1];

            text += `• @${user.split("@")[0]} - ${count}/3\n`;
        }

        if (!found) {
            text = "✅ No users currently have warnings.";
        }

        await sock.sendMessage(jid, {
            text,
            mentions: found
                ? Object.keys(warns)
                    .filter(k => k.startsWith(jid + "_"))
                    .map(k => k.split("_")[1])
                : []
        });

    }

};
