module.exports = {

    name: "restart",

    description: "Restart WhisperBot",

    category: "owner",

    permission: "sudo",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`🔄 Restart request accepted.

😂 Hold my circuits together... I'll be right back!`
        });

        setTimeout(() => {
            process.exit(0);
        }, 1500);

    }

};
