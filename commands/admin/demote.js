const { t } = require("../../lib/lang");
const groups = require("../../lib/groups");
module.exports = {

    name: "demote",

    description: "Remove admin status from a member",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        const context = msg.message?.extendedTextMessage?.contextInfo;

        let target = context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: t("demote_target_required")
            });
        }

        try {

            await groups.demote(
    sock,
    jid,
    target
);

            await sock.sendMessage(jid, {
                text: t("demote_success")
            });

} catch (err) {

    console.log("Demote error:", err);

    const message = (
        err?.message ||
        err?.data ||
        ""
    ).toString().toLowerCase();

    if (
        message.includes("not-authorized") ||
        message.includes("not authorized") ||
        message.includes("not admin") ||
        message.includes("403")
    ) {

        return await sock.sendMessage(jid, {
            text: t(jid, "admin.bot_not_admin")
        });

    }

    await sock.sendMessage(jid, {
        text: t(jid, "admin.demote_failed")
    });

}

    }
};
