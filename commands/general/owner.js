module.exports = {
    name: "owner",

    description: "Show bot owner",

    category: "general",

    execute: async (sock, msg) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: "👑 Owner: The-whisperer_237"
            }
        );

    }
};