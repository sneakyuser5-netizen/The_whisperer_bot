const { t } = require("../../lib/lang");

module.exports = {

    name: "test",

    description: "Test new plugin",

    category: "tools",

    permission: "public",

    usage: ".test text",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: `${t("tools.test_success")}\n${t("tools.test_sent")} ${args.join(" ")}`
            }
        );

    }

};
