module.exports = {

    name: "ping2",

    description: "Advanced ping",

    category: "info",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;


        const start = Date.now();


        const sent = await sock.sendMessage(jid, {
            text: "🏓 Testing connection..."
        });


        const speed = Date.now() - start;


        const memory =
            Math.round(
                process.memoryUsage().rss / 1024 / 1024
            );


        await sock.sendMessage(jid, {
            text:
`🏓 *PONG!*

⚡ Speed:
${speed}ms

🧠 Memory:
${memory}MB

🟢 Status:
Online ✅

😂 Still alive and causing problems.`
        });

    }

};
