module.exports = {
    name: "hi",
    alias: [],
    description: "Greeting command",

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        await sock.sendMessage(jid, { text: "Hello 👋" });
    }
};
