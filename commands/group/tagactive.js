const activity = require("../../lib/activity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "tagactive",

    description: "Mention recently active members",

    category: "group",

    permission: "admin",

    usage: ".tagactive [minutes]",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const minutes = Math.max(parseInt(args[0]) || 30, 1);

        const cutoff = Date.now() - (minutes * 60 * 1000);

        const metadata = await sock.groupMetadata(jid);

        const active = [];

        for (const member of metadata.participants) {

            const id = member.id;

            const last = activity.get(jid, id);

            if (last < cutoff) continue;

            active.push({ id, last });

        }

        if (!active.length) {

            return sock.sendMessage(jid, {
                text: t("group.tagactive_none")
                    .replace("{minutes}", minutes)
                    .replace("{plural}", minutes === 1 ? "" : "s")
            });

        }

        active.sort((a, b) => b.last - a.last);

        let text =
`${t("group.tagactive_title")}

${t("group.tagactive_last")}
${minutes} ${t("group.tagactive_minutes")}${minutes === 1 ? "" : "s"}

${t("group.tagactive_total")}: ${active.length}

`;

        const mentions = [];

        active.forEach((user, index) => {

            mentions.push(user.id);

            text += `${index + 1}. @${user.id.split("@")[0]}\n`;

        });

        text += `\n${t("group.tagactive_footer")}`;

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
