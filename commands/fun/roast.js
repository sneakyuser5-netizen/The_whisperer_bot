module.exports = {

    name: "roast",

    description: "Funny roast a user",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const context =
            msg.message?.extendedTextMessage?.contextInfo;


        let target = context?.mentionedJid?.[0];


        if (!target && context?.participant) {
            target = context.participant;
        }


        if (!target) {
            return sock.sendMessage(jid, {
                text:
`😂 Who should I roast?

Mention someone first.

Example:
.roast @user`
            });
        }


        const roasts = [

            "😂 Your WiFi signal has more confidence than you.",

            "🤣 You are not lazy, you are just on energy-saving mode.",

            "😂 Your phone battery dies faster than your plans.",

            "🤣 Even Google needs a break after searching for your logic.",

            "😂 You bring everyone happiness... when you leave the room.",

            "🤣 Your brain is like a browser with 100 tabs open and nothing loading.",

            "😂 You are proof that updates can fail sometimes."
        ];


        const roast =
            roasts[Math.floor(Math.random() * roasts.length)];


        await sock.sendMessage(jid, {
            text:
`🔥 ROAST TIME 🔥

@${target.split("@")[0]}

${roast}

😂 Don't cry, it's just comedy!`,
            mentions: [target]
        });

    }

};
