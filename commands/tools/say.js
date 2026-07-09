module.exports = {

    name: "say",

    description: "Alias of echo",

    category: "tools",

    execute: async (sock, msg, args) => {

        if (!args.length) {

            return sock.sendMessage(msg.key.remoteJid, {
                text: "Usage:\n.say Hello"
            });

        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: args.join(" ")
        });

    }

};
