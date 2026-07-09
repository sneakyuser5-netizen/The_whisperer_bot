module.exports = {

    name: "8ball",

    description: "Ask the magic ball",

    category: "fun",

    permission: "all",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;


        if (!args.length) {
            return sock.sendMessage(jid, {
                text:
`🎱 Ask me a question.

Example:
.8ball Will I become rich?`
            });
        }


        const answers = [

            "😂 Definitely yes!",
            "🤔 Maybe... try again later.",
            "🔥 Without a doubt!",
            "💀 My magic ball is confused.",
            "😎 The chances are looking good.",
            "😂 Ask your WiFi first.",
            "🚀 Yes, but work for it.",
            "❌ Not today, my friend."

        ];


        const answer =
            answers[Math.floor(Math.random() * answers.length)];


        await sock.sendMessage(jid, {
            text:
`🎱 MAGIC 8-BALL

Question:
${args.join(" ")}

Answer:
${answer}`
        });

    }

};
