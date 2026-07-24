const { t } = require("../../lib/lang");

module.exports = {

    name: "truth",

    description: "Random truth question",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const truths = [
            t(jid, "fun.truth_1"),
            t(jid, "fun.truth_2"),
            t(jid, "fun.truth_3"),
            t(jid, "fun.truth_4"),
            t(jid, "fun.truth_5"),
            t(jid, "fun.truth_6"),
            t(jid, "fun.truth_7")
        ];

        const truth =
            truths[Math.floor(Math.random() * truths.length)];

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.truth_title")}

${truth}

${t(jid, "fun.truth_footer")}`
        });

    }

};
