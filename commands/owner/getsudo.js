const sudo = require("../../lib/sudo");
const identity = require("../../lib/identity");
module.exports = {

    name: "getsudo",

    description: "Show sudo members",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

    const jid = msg.key.remoteJid;

    const identity = require("../../lib/identity");

    const owner =
        identity.getBotOwner();

    const users =
        sudo.all(owner);

    if (!users.length) {

        return sock.sendMessage(jid, {
            text:
`😂 You don't have any sudo members yet.

Use *.setsudo* by replying to someone's message.`
        });

    }

    let text =
`👑 *Your Sudo Members*

`;

    for (const user of users) {

        text += `• @${user}\n`;

    }

    await sock.sendMessage(jid, {
        text,
        mentions: users.map(
            u => `${u}@lid`
        )
    });
 }
};
        
