const fs = require("fs");

module.exports = {

    name: "getsudo",

    description: "Show sudo members",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const file = "./database/sudo.json";

        if (!fs.existsSync(file)) {

            return sock.sendMessage(jid, {
                text: "❌ No sudo members found."
            });

        }

        const data = JSON.parse(
            fs.readFileSync(file)
        );

        const users = Object.keys(data);

        if (!users.length) {

            return sock.sendMessage(jid, {
                text: "❌ No sudo members found."
            });

        }

        let text = "👑 Sudo Members\n\n";

        for (const user of users) {

            text += `• @${user.split("@")[0]}\n`;

        }

        await sock.sendMessage(jid, {
            text,
            mentions: users
        });

    }

};
