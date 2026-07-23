const { t } = require("../../lib/lang");

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
                text: t(jid, "fun.compliment_usage")
            });
        }

        const compliments = [
            t(jid, "fun.compliment_1"),
            t(jid, "fun.compliment_2"),
            t(jid, "fun.compliment_3"),
            t(jid, "fun.compliment_4"),
            t(jid, "fun.compliment_5")
        ];

        const text =
            compliments[Math.floor(Math.random() * compliments.length)];

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.compliment_title")}

@${target.split("@")[0]}

${text}`,
            mentions: [target]
        });

    }

};
