module.exports = {

    name: "invitelink",

    description: "Get the group's invite link",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        try {

            const code = await sock.groupInviteCode(jid);

            await sock.sendMessage(jid, {
                text:
`🔗 Group Invite Link

https://chat.whatsapp.com/${code}`
            });

        } catch {

            await sock.sendMessage(jid, {
                text: "❌ I couldn't get the invite link. Make sure I'm an admin."
            });

        }

    }

};
