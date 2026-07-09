module.exports = {

    name: "echo",

    description: "Repeat your text",

    category: "tools",

    execute: async (sock, msg, args) => {

        if (!args.length) {

            return sock.sendMessage(msg.key.remoteJid, {
                text: "Usage:\n.echo Hello"
            });

        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: args.join(" ")
        });

    }

};
