module.exports = {

    name: "ship",

    description: "Calculate friendship/love percentage",

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
`❤️ Who should I ship?

Mention someone.

Example:
.ship @user`
            });
        }


        const percent = Math.floor(Math.random() * 101);


        let reaction;

        if (percent > 80) {
            reaction = "🔥 Perfect match!";
        } else if (percent > 50) {
            reaction = "😏 Something is cooking...";
        } else if (percent > 20) {
            reaction = "😂 The connection needs WiFi.";
        } else {
            reaction = "💀 Even WhatsApp gave up.";
        }


        await sock.sendMessage(jid, {
            text:
`❤️ SHIP CALCULATOR

@${target.split("@")[0]}

Compatibility:
${percent}%

${reaction}`,
            mentions: [target]
        });

    }

};
