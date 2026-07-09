module.exports = {

    name: "userinfo",

    description: "Show information about yourself or a mentioned user",

    category: "general",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const context = msg.message?.extendedTextMessage?.contextInfo;

        let user =
            context?.mentionedJid?.[0] ||
            context?.participant ||
            msg.key.participant ||
            msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`👤 User Information

Number: ${user.split("@")[0]}
JID: ${user}`
        });

    }

};
