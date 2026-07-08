module.exports = {
    name: "hi",

    description: "Greeting command",

    category: "general",

    execute: async (sock, msg) => {
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: "Hello 👋"
            }
        );
    }
};



