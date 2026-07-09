module.exports = {

    name: "memory",

    description: "Show current memory usage",

    category: "general",

    execute: async (sock, msg) => {

        const used = process.memoryUsage();

        const ram = (used.heapUsed / 1024 / 1024).toFixed(2);

        await sock.sendMessage(msg.key.remoteJid, {
            text: `💾 Memory Usage\n\n${ram} MB`
        });

    }

};
