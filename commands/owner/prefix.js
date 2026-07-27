const settings = require("../../lib/settings");

module.exports = {
    name: "prefix",
    description: "Change bot prefix",
    category: "owner",
    permission: "owner",
    usage: ".prefix ! or .prefix=!",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;

        if (!args.length) {
            const current = settings.get(jid).prefix || ".";
            return sock.sendMessage(jid, {
                text:
`Current prefix: ${current}

Usage:
${current}prefix !
or
${current}prefix=!

Example:
${current}menu`
            });
        }

        const newPrefix = args[0].trim();

        if (newPrefix.length > 3) {
            return sock.sendMessage(jid, {
                text: "❌ Prefix too long. Maximum is 3 characters."
            });
        }

        if (newPrefix.includes(" ")) {
            return sock.sendMessage(jid, {
                text: "❌ Prefix cannot contain spaces."
            });
        }

        settings.set(jid, "prefix", newPrefix);

        return sock.sendMessage(jid, {
            text:
`✅ Prefix changed to: ${newPrefix}

Now use:
${newPrefix}menu`
        });
    }
};
