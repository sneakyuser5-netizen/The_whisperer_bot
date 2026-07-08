module.exports = {

    name: "restart",

    description: "Restart bot",

    category: "owner",

    ownerOnly: true,

    execute: async (sock, msg) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: "🔄 Restart command received."
            }
        );

    }
};