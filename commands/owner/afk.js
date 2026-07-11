const afk = require("../../lib/afk");
const identity = require("../../lib/identity");

module.exports = {

    name: "afk",

    description: "Set yourself AFK",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const sender = identity.getSender(msg);

        const reason =

            args.join(" ") ||

            "No reason given.";

        afk.set(sender, reason);

        await sock.sendMessage(jid, {

            text:

`😴 You're now AFK.

📝 Reason:
${reason}

😂 I'll let everyone know you're pretending to be busy.`

        });

    }

};
