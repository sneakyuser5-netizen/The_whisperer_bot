const { t } = require("../../lib/lang");

module.exports = {
    name: "approve",
    category: "admin",
    description: "Approve all pending group join requests",
    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "group_only")
            });
        }

        try {

            const requests = await sock.groupRequestParticipantsList(jid);

            if (!requests.length) {
                return sock.sendMessage(jid, {
                    text: t(jid, "admin.approve_none")
                });
            }

            for (const user of requests) {
                await sock.groupRequestParticipantsUpdate(
                    jid,
                    [user.jid],
                    "approve"
                );
            }

            await sock.sendMessage(jid, {
                text: t(jid, "admin.approve_success")
                    .replace("{count}", requests.length)
            });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(jid, {
                text: t(jid, "admin.approve_failed")
            });

        }

    }
};
