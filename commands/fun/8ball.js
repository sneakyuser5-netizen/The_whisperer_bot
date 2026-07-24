const { t } = require("../../lib/lang");

module.exports = {

    name: "8ball",

    description: "Ask the magic ball",

    category: "fun",

    permission: "all",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(jid, {
                text: t(jid, "fun.8ball_usage")
            });
        }

        const answers = [
            t(jid, "fun.8ball_answer_1"),
            t(jid, "fun.8ball_answer_2"),
            t(jid, "fun.8ball_answer_3"),
            t(jid, "fun.8ball_answer_4"),
            t(jid, "fun.8ball_answer_5"),
            t(jid, "fun.8ball_answer_6"),
            t(jid, "fun.8ball_answer_7"),
            t(jid, "fun.8ball_answer_8")
        ];

        const answer =
            answers[Math.floor(Math.random() * answers.length)];

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.8ball_title")}

${t(jid, "fun.8ball_question")}
${args.join(" ")}

${t(jid, "fun.8ball_answer")}
${answer}`
        });

    }

};
