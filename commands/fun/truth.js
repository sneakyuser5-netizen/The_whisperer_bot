module.exports = {

    name: "truth",

    description: "Random truth question",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;


        const truths = [

            "😂 What is your most embarrassing moment?",

            "😏 Who was your first crush?",

            "🤣 What is the weirdest thing you have searched online?",

            "👀 What secret have you never told anyone?",

            "😂 What is your biggest fear?",

            "😎 What is one thing you regret doing?",

            "🔥 Who in this group makes you laugh the most?"

        ];


        const truth =
            truths[Math.floor(Math.random() * truths.length)];


        await sock.sendMessage(jid, {
            text:
`😈 TRUTH TIME

${truth}

Answer honestly... or the bot will know 😂`
        });

    }

};
