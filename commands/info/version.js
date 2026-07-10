module.exports = {

    name: "version",

    description: "Show Baileys version",

    category: "info",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const version =
            require("@whiskeysockets/baileys/package.json").version;

        await sock.sendMessage(jid, {
            text: `Baileys Version: ${version}`
        });

    }

};
