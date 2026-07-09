const sudo = require("../../lib/sudo");

module.exports = {

    name: "setsudo",

    description: "Add a sudo member",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        let target =
            context?.mentionedJid?.[0] ||
            context?.participant;

        if (!target) {

            return sock.sendMessage(jid, {
                text: "❌ Reply to or mention a user."
            });

        }

        sudo.add(target);

        await sock.sendMessage(jid, {
            text:
`✅ Sudo added

User: @${target.split("@")[0]}`,
            mentions: [target]
        });

    }

};
