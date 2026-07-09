module.exports = {

    name: "runtime",

    description: "Show Node.js runtime version",

    category: "general",

    execute: async (sock, msg) => {

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`🖥️ Runtime

Node.js: ${process.version}`
        });

    }

};
