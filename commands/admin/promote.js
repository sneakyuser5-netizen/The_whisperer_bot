const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "promote",

    description: "Promote a member to admin",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const context = msg.message?.extendedTextMessage?.contextInfo;

        let target = context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.promote_usage")
            });
        }

        try {

            await groups.promote(
                sock,
                jid,
                target
            );

            await sock.sendMessage(jid, {
                text: t(jid, "admin.promote_success")
            });

} catch (err) {

    console.log("Promote error:", err);

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
        text: t(jid, "admin.promote_failed")
    });

}

    }
};
