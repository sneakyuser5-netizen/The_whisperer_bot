module.exports = {

    name: "invite",

    description: "Get group invite link",

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

            const link = `https://chat.whatsapp.com/${code}`;

            await sock.sendMessage(jid, {
                text: `🔗 Group Invite Link:\n\n${link}`
            });

        } catch (err) {

            console.log("Invite error:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to get invite link. Make sure I am admin."
            });

        }

    }
};