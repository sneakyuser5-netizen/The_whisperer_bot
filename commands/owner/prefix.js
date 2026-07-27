const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "prefix",
    description: "Change bot prefix",
    category: "owner",
    permission: "owner",
    usage: ".prefix=!",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const newPrefix = text.split(".prefix=")[1]?.trim();

        if (!newPrefix) {
            const current = settings.get(jid).prefix || ".";
            return sock.sendMessage(jid, {
                text: `Current prefix: ${current}\n\nUsage:.prefix=!\nExample: ${current}menu`
            });
        }

        if (newPrefix.length > 3) {
            return sock.sendMessage(jid, { text: "❌ Prefix too long. Max 3 characters." });
        }

        if (newPrefix.includes(" ")) {
            return sock.sendMessage(jid, { text: "❌ Prefix cannot contain spaces." });
        }

        settings.set(jid, "prefix", newPrefix);

        await sock.sendMessage(jid, {
            text: `✅ Prefix changed to: ${newPrefix}\n\nNow use: ${newPrefix}menu`
        });
    }
};
