const os = require("os");

module.exports = {

    name: "server",

    description: "Show server information",

    category: "general",

    execute: async (sock, msg) => {

        const text =
`🖥️ Server Information

Platform: ${os.platform()}

Architecture: ${os.arch()}

CPU Cores: ${os.cpus().length}

Hostname: ${os.hostname()}`;

        await sock.sendMessage(msg.key.remoteJid, {
            text
        });

    }

};
