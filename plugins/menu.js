const fs = require("fs");

module.exports = {
    name: "menu",
    alias: [],
    description: "Show all commands",

    async execute(sock, msg, args, plugins) {
        const jid = msg.key.remoteJid;

        const list = plugins.map(p => `• ${p.name}`).join("\n");

        await sock.sendMessage(jid, {
            text: `📌 MENU\n\n${list}\n\nTotal: ${plugins.length}`
        });
    }
};
