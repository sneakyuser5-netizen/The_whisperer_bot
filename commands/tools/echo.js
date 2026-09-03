const { t } = require("../../lib/lang");

module.exports = {

    name: "echo",

    description: "Repeat your text",

    category: "tools",

    execute: async (sock, msg, args) => {

        if (!args.length) {

            return sock.sendMessage(msg.key.remoteJid, {
                text: t("tools.echo_usage")
            });

        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: args.join(" ")
        });

    }

};
