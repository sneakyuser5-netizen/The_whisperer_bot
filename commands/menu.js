module.exports = {
    name: "menu",
    execute: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, {
            text:
`📌 MENU

Commands:
• hi
• .ping
• .menu`
        });
    }
}
