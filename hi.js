module.exports = {
    name: "hi",
    execute: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, {
            text: "Hello 👋"
        });
    }
}