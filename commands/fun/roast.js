const { t } = require("../../lib/lang");

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
                text: t(jid, "fun.roast_usage")
            });
        }

        const roasts = [
            t(jid, "fun.roast_1"),
            t(jid, "fun.roast_2"),
            t(jid, "fun.roast_3"),
            t(jid, "fun.roast_4"),
            t(jid, "fun.roast_5"),
            t(jid, "fun.roast_6"),
            t(jid, "fun.roast_7")
        ];

        const roast =
            roasts[Math.floor(Math.random() * roasts.length)];

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.roast_title")}

@${target.split("@")[0]}

${roast}

${t(jid, "fun.roast_footer")}`,
            mentions: [target]
        });

    }

};
