const fs = require("fs");
const path = require("path");
const settingsFile = path.join(__dirname, "../../database/settings.json");

module.exports = {
    name: "prefix",
    description: "Change bot prefix",
    category: "owner",
    permission: "owner", // only owner can use
    usage: ".prefix=!",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;

        // Get full text because args won't catch =
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const newPrefix = text.split(".prefix=")[1]?.trim();

        if (!newPrefix) {
            return sock.sendMessage(jid, {
                text: "❌ Usage:.prefix=!\nExample:.prefix=."
            });
        }

        if (newPrefix.length > 3) {
            return sock.sendMessage(jid, {
                text: "❌ Prefix too long. Max 3 characters."
            });
        }

        if (newPrefix.includes(" ")) {
            return sock.sendMessage(jid, {
                text: "❌ Prefix cannot contain spaces."
            });
        }

        // Load settings
        let settings = {};
        try {
            settings = JSON.parse(fs.readFileSync(settingsFile));
        } catch {
            settings = {};
        }

        if (!settings[jid]) settings[jid] = {};
        settings[jid].prefix = newPrefix;

        // Save
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

        await sock.sendMessage(jid, {
            text: `✅ Prefix changed to: ${newPrefix}\n\nNow use: ${newPrefix}help`
        });
    }
};
