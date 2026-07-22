const { t } = require("../../lib/lang");

module.exports = {

    name: "revoke",

    description: "Generate a new group invite link",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        try {

            await sock.groupRevokeInvite(jid);

            const code = await sock.groupInviteCode(jid);

            await sock.sendMessage(jid, {
                text:
`${t("admin.revoke_reset")}

${t("admin.revoke_new_link_base")}https://chat.whatsapp.com/${code}`
            });

        } catch (err) {

            console.log("Revoke error:", err);

            await sock.sendMessage(jid, {
                text: t("admin.revoke_failed")
            });

        }

    }

};
