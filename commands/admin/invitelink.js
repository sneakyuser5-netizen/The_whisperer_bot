const { t } = require("../../lib/lang");

module.exports = {

    name: "invitelink",

    description: "Get the group's invite link",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        try {

            const code = await sock.groupInviteCode(jid);

            await sock.sendMessage(jid, {
                text:
`${t("group_invite_link_title")}

https://chat.whatsapp.com/${code}`
            });

        } catch {

            await sock.sendMessage(jid, {
                text: t("invite_link_error_alt")
            });

        }

    }

};
