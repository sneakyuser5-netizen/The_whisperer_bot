const groups = require("../../lib/groups");
module.exports = {

    name: "kick",

    description: "Remove a member from the group",

    category: "admin",

    permission: "admin",

    usage: ".kick @user",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        // Check group
        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }


        // Get mentioned user
        const context = msg.message?.extendedTextMessage?.contextInfo;

console.log("KICK CONTEXT:", context);

let target = context?.mentionedJid?.[0];

if (!target && context?.participant) {
    target = context.participant;
}

if (!target) {
    return sock.sendMessage(jid, {
        text: "❌ Reply to a user's message or mention them.\n\nExample:\n.kick @user"
    });
}


        try {

            await groups.remove(
    sock,
    jid,
    target
);


            await sock.sendMessage(jid, {
                text: `✅ User removed successfully.`
            });


        } catch (err) {

            console.log("Kick error:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to remove user. Make sure I am an admin."
            });

        }

    }
};
