const warns = require("../../lib/warns");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");
module.exports = {

    name: "resetwarn",

    description: "Reset a user's warnings",

    category: "admin",

    permission: "admin",

    usage: ".resetwarn @user",

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
                text: t(jid, "admin.resetwarn_usage")
            });
        }

const user = identity.normalize(target);

warns.reset(jid, user);
        await sock.sendMessage(jid, {
            text:
`${t(jid, "admin.resetwarn_success")}\n\nUser: @${target.split("@")[0]}\nWarnings: 0/5`,
            mentions: [target]
        });

    }

};
