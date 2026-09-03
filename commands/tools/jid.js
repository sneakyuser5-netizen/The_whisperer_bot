module.exports = {

    name: "jid",

    description: "Show the current chat JID",

    category: "tools",

    execute: async (sock, msg) => {

        await sock.sendMessage(msg.key.remoteJid, {
            text: msg.key.remoteJid
        });

    }

};
