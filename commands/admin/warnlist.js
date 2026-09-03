const warns = require("../../lib/warns");
const { t } = require("../../lib/lang");

module.exports = {

    name: "warnlist",

    description: "Show all warned users",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const list = warns.list(jid);

        let text = `${t(jid, "admin.warnlist_title")}\n\n`;
        let found = false;

        for (const member of list) {

            if (member.warns <= 0) continue;

            found = true;
            text += `• @${member.jid.split("@")[0]} - ${member.warns}/5\n`;

        }

        if (!found) {
            text = t(jid, "admin.warnlist_empty");
        }

        await sock.sendMessage(jid, {
            text,
            mentions: found
                ? list.map(member => member.jid)
                : []
        });

    }

};
