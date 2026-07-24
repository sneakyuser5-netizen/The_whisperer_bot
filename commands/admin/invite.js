const { t } = require("../../lib/lang");

module.exports = {

    name: "invite",

    description: "Get group invite link",

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

            const link = `https://chat.whatsapp.com/${code}`;

            await sock.sendMessage(jid, {
                text: `${t("group_invite_link_header")}\n\n${link}`
            });

        } catch (err) {

            console.log("Invite error:", err);

            await sock.sendMessage(jid, {
                text: t("invite_link_error")
            });

        }

    }
};
