const { t } = require("../../lib/lang");

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
                text: t(jid, "fun.ship_usage")
            });
        }

        const percent = Math.floor(Math.random() * 101);

        let reaction;

        if (percent > 80) {
            reaction = t(jid, "fun.ship_reaction_1");
        } else if (percent > 50) {
            reaction = t(jid, "fun.ship_reaction_2");
        } else if (percent > 20) {
            reaction = t(jid, "fun.ship_reaction_3");
        } else {
            reaction = t(jid, "fun.ship_reaction_4");
        }

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.ship_title")}

@${target.split("@")[0]}

${t(jid, "fun.ship_compatibility")}
${percent}%

${reaction}`,
            mentions: [target]
        });

    }

};
