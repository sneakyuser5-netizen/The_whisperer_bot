const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "tagadmins",

    description: "Tag all group admins",

    category: "admin",

    permission: "user",

    usage: ".tagadmins",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const members = await groups.members(sock, jid);
        const admins = members.filter(m => m.admin);

        let text = `${t("admin.tagadmins_title")}\n\n`;
        const mentions = [];

        for (const admin of admins) {
            text += `@${admin.id.split("@")[0]}\n`;
            mentions.push(admin.id);
        }

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }
};
