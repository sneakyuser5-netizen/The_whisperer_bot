module.exports = {

    name: "compliment",

    description: "Give someone a compliment",

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
`😂 Who deserves a compliment?

Mention someone first.

Example:
.compliment @user`
            });
        }


        const compliments = [

            "✨ Your energy is brighter than a phone screen at midnight.",

            "😎 You are the reason this chat has some class.",

            "🔥 You are officially approved by the vibe department.",

            "😂 Even the bot has to admit you're doing something right.",

            "🌟 You make ordinary conversations better."

        ];


        const text =
            compliments[Math.floor(Math.random() * compliments.length)];


        await sock.sendMessage(jid, {
            text:
`💎 COMPLIMENT TIME

@${target.split("@")[0]}

${text}`,
            mentions: [target]
        });

    }

};
