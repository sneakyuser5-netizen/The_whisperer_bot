module.exports = {

    name: "dare",

    description: "Random dare challenge",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;


        const dares = [

            "😂 Change your profile picture for 10 minutes.",

            "🤣 Send the last emoji you used.",

            "🔥 Say something nice about the person above you.",

            "😎 Send a voice note saying 'I am the boss'.",

            "😂 Let someone choose your next status.",

            "🤣 Type a message with your eyes closed."

        ];


        const dare =
            dares[Math.floor(Math.random() * dares.length)];


        await sock.sendMessage(jid, {
            text:
`🔥 DARE TIME

Your challenge:

${dare}

Good luck 😂`
        });

    }

};
