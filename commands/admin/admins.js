const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "admins",

    description: "Show all group admins",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        const members = await groups.members(sock, jid);

        const admins = members.filter(member => member.admin);

        let text = t("group_admins_title") + "\n\n";
        const mentions = [];

        for (const admin of admins) {

            const user = admin.id || admin.jid;

            mentions.push(user);

            text += `• @${user.split("@")[0]}\n`;

        }

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
