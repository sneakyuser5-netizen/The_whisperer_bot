const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "admincount",

    description: "Show the number of group admins",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        const members = await groups.members(sock, jid);

        const count = members.filter(m => m.admin).length;

        await sock.sendMessage(jid, {
            text: t("admin_count_message").replace("{count}", count)
        });

    }

};
