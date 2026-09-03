const { t } = require("../../lib/lang");

module.exports = {

    name: "joke",

    description: "Get a random funny joke",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const jokes = [
            t(jid, "fun.joke_1"),
            t(jid, "fun.joke_2"),
            t(jid, "fun.joke_3"),
            t(jid, "fun.joke_4"),
            t(jid, "fun.joke_5"),
            t(jid, "fun.joke_6"),
            t(jid, "fun.joke_7"),
            t(jid, "fun.joke_8")
        ];

        const joke =
            jokes[Math.floor(Math.random() * jokes.length)];

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.joke_title")}

${joke}

${t(jid, "fun.joke_footer")}`
        });

    }

};
