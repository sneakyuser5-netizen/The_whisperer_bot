const activity = require("../../lib/activity");
const identity = require("../../lib/identity");
const config = require("../../config");
const { t } = require("../../lib/lang");

module.exports = {

    name: "seen",

    description: "Show when a user was last active",

    category: "group",

    permission: "admin",

    usage: ".seen @user",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        let target =
            context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: t("group.seen_usage")
            });
        }

        const user = identity.normalize(target);

        const last = activity.get(jid, user);

        if (!last) {

            return sock.sendMessage(jid, {
                text:
`${t("group.seen_title")}

${t("group.seen_user")}: @${target.split("@")[0]}

${t("group.seen_no_activity")}`,
                mentions: [target]
            });

        }

        const ago =
            activity.format(Date.now() - last);

        const date = new Date(last).toLocaleString("en-GB", {
            timeZone: config.TIMEZONE,
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        await sock.sendMessage(jid, {
            text:
`${t("group.seen_title")}

${t("group.seen_user")}: @${target.split("@")[0]}

${t("group.seen_last_message")}
${ago} ago

${t("group.seen_date")}
${date}

${t("group.seen_footer")}`,
            mentions: [target]
        });

    }

};
