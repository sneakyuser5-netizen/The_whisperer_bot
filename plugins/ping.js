module.exports = {
    name: "ping",
    alias: ["p"],
    description: "Check bot response",

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        await sock.sendMessage(jid, { text: "🏓 Pong!" });
    }
};
