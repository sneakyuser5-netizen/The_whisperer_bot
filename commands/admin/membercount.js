const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "membercount",

    description: "Show the number of group members",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const members = await groups.members(sock, jid);

        await sock.sendMessage(jid, {
            text: `${t(jid, "admin.membercount_total")} ${members.length}`
        });

    }

};
