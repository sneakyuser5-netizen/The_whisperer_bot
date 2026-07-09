module.exports = {

    name: "uptime",

    description: "Show bot uptime",

    category: "general",

    execute: async (sock, msg) => {

        let seconds = Math.floor(process.uptime());

        const days = Math.floor(seconds / 86400);
        seconds %= 86400;

        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;

        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        await sock.sendMessage(msg.key.remoteJid, {
            text:
`⏱️ Uptime

${days}d ${hours}h ${minutes}m ${seconds}s`
        });

    }

};
