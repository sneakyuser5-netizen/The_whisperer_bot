const { t } = require("../../lib/lang");

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
                text: t(jid, "fun.rate_usage")
            });
        }

        const score =
            Math.floor(Math.random() * 101);

        let comment;

        if (score >= 90) {
            comment = t(jid, "fun.rate_legendary");
        }
        else if (score >= 70) {
            comment = t(jid, "fun.rate_good");
        }
        else if (score >= 40) {
            comment = t(jid, "fun.rate_average");
        }
        else {
            comment = t(jid, "fun.rate_bad");
        }

        await sock.sendMessage(jid, {
            text:
`${t(jid, "fun.rate_title")}

${t(jid, "fun.rate_user")}
@${target.split("@")[0]}

${t(jid, "fun.rate_score")}
${score}/100

${comment}`,
            mentions: [target]
        });

    }

};
