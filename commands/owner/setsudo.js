const sudo = require("../../lib/sudo");

module.exports = {

    name: "setsudo",

    description: "Add a sudo member",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

    const jid = msg.key.remoteJid;

    const quoted =
        msg.message?.extendedTextMessage?.contextInfo;

    const target =
        quoted?.participant ||
        quoted?.mentionedJid?.[0];

    if (!target) {

        return sock.sendMessage(jid, {
            text: "😂 Reply to someone's message first.\n\nI can't promote invisible people. 👻"
        });

    }

    const identity = require("../../lib/identity");

    const id = identity.normalize(target);

    sudo.add(
    identity.getBotOwner(),
    id
);

    await sock.sendMessage(jid, {
        text:
`✅ New Sudo unlocked! 🛡️

@${id} can now boss the bot around (almost 😏).`,
        mentions: [target]
    });

    }

};
