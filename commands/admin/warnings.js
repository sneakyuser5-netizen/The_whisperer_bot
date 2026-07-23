const warns = require("../../lib/warns");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "warnings",

    description: "Check a user's warnings",

    category: "admin",

    permission: "admin",

    usage: ".warnings @user",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const context = msg.message?.extendedTextMessage?.contextInfo;

        let target = context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.warnings_usage")
            });
        }

        const user = identity.normalize(target);

        const count = warns.get(jid, user);

        await sock.sendMessage(jid, {
            text:
`${t(jid, "admin.warnings_title")}

${t(jid, "admin.warnings_user")} @${target.split("@")[0]}
${t(jid, "admin.warnings_count")} ${count}/5`,
            mentions: [target]
        });

    }

};
