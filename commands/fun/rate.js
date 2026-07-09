module.exports = {

    name: "rate",

    description: "Rate a user",

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
`😂 Who should I rate?

Mention someone first.

Example:
.rate @user`
            });

        }


        const score =
            Math.floor(Math.random() * 101);


        let comment;


        if (score >= 90) {
            comment = "🔥 Legendary!";
        }
        else if (score >= 70) {
            comment = "😎 Pretty good!";
        }
        else if (score >= 40) {
            comment = "😂 Needs some updates.";
        }
        else {
            comment = "💀 The rating system crashed.";
        }


        await sock.sendMessage(jid, {
            text:
`⭐ RATING SYSTEM

User:
@${target.split("@")[0]}

Score:
${score}/100

${comment}`,
            mentions: [target]
        });

    }

};
