const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "tagadmins",

    description: "Mention all group admins",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const members = await groups.members(sock, jid);
        const admins = members.filter(m => m.admin);

        let text = `${t(jid, "admin.tagadmins_title")}\n\n`;
        const mentions = [];

        for (const admin of admins) {

            mentions.push(admin.id);

            text += `• @${admin.id.split("@")[0]}\n`;

        }

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
