const { t } = require("../../lib/lang");

module.exports = {

    name: "say",

    description: "Alias of echo",

    category: "tools",

    execute: async (sock, msg, args) => {

        if (!args.length) {

            return sock.sendMessage(msg.key.remoteJid, {
                text: t("tools.say_usage")
            });

        }

        await sock.sendMessage(msg.key.remoteJid, {
            text: args.join(" ")
        });

    }

};
