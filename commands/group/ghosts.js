const activity = require("../../lib/activity");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "ghosts",

    description: "List members who have never spoken",

    category: "group",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const metadata =
            await sock.groupMetadata(jid);

        const active =
            activity.getGroup(jid);

        const ghosts = [];

        for (const member of metadata.participants) {

            const id =
                identity.normalize(member.id);

            // Skip the bot
            if (
                identity.normalize(member.id) ===
                identity.normalize(sock.user.id)
            ) {
                continue;
            }

            // Skip admins
            if (member.admin) {
                continue;
            }

            if (!active[id]) {
                ghosts.push(member.id);
            }

        }

        if (!ghosts.length) {

            return sock.sendMessage(jid, {
                text: t("group.ghosts_none")
            });

        }

        let text =
`${t("group.ghosts_title")}

${t("group.ghosts_total")}: ${ghosts.length}

`;

        ghosts.forEach((id, i) => {

            text += `${i + 1}. @${id.split("@")[0]}\n`;

        });

        text += `\n${t("group.ghosts_footer")}`;

        await sock.sendMessage(jid, {
            text,
            mentions: ghosts
        });

    }

};
