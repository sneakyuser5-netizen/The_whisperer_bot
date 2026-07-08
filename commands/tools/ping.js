module.exports = {

    name: "ping",

    aliases: ["p"],

    category: "tools",

    description: "Check bot response speed",

    permission: "public",
    cooldown: 5,

    execute: async (sock, msg) => {

        const start = Date.now();

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: `🏓 Pong!\nResponse time: ${Date.now() - start}ms`
            }
        );

    }
};

