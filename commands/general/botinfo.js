module.exports = {

    name: "botinfo",

    description: "Show information about the bot",

    category: "general",

    execute: async (sock, msg) => {

        const text =
`🤖 WhispererBot

Version: 1.0.0
Library: Baileys
Language: JavaScript (Node.js)

Developer: You`;

        await sock.sendMessage(msg.key.remoteJid, {
            text
        });

    }

};
