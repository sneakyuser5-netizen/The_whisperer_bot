const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "groupinfo",

    description: "Show information about the group",

    category: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const data = await groups.metadata(sock, jid);

        const admins = data.participants.filter(p => p.admin).length;

        const text =
`${t(jid, "admin.groupinfo_title")}

${t(jid, "admin.groupinfo_name")}: ${data.subject}

${t(jid, "admin.groupinfo_members")}: ${data.participants.length}

${t(jid, "admin.groupinfo_admins")}: ${admins}

${t(jid, "admin.groupinfo_description")}:
${data.desc || t(jid, "admin.groupinfo_no_description")}`;

        await sock.sendMessage(jid, {
            text
        });

    }

};
