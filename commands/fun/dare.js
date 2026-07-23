const { t } = require("../../lib/lang");

module.exports = {

    name: "dare",

    description: "Random dare challenge",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const dares = [
            t(jid, "fun.dare_1"),
            t(jid, "fun.dare_2"),
            t(jid, "fun.dare_3"),
            t(jid, "fun.dare_4"),
            t(jid, "fun.dare_5"),
            t(jid, "fun.dare_6")
        ];

        const dare =
            dares[Math.floor(Math.random() * dares.length)];

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.dare_title")}

${t(jid, "fun.dare_challenge")}

${dare}

${t(jid, "fun.dare_goodluck")}`
        });

    }

};
