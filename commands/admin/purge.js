const { t } = require("../../lib/lang");

module.exports = {
    name: "purge",
    description: "Delete recent messages",
    category: "admin",
    permission: "admin",
    usage: ".purge 10",
    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }

        const amount = Number(args[0]);

        if (
            isNaN(amount) ||
            amount < 1 ||
            amount > 100
        ) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_usage")
            });
        }

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        if (!context?.stanzaId) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_reply")
            });
        }

        const messages = global.messageCache?.[jid];

        if (!messages) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_no_history")
            });
        }

        const index = messages.findIndex(
            m => m.key.id === context.stanzaId
        );

        if (index === -1) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_not_found")
            });
        }

        const selected = messages.slice(
            Math.max(0, index - amount + 1),
            index + 1
        );

        let deleted = 0;

        for (const m of selected) {
            try {
                await sock.sendMessage(jid, {
                    delete: m.key
                });

                deleted++;

                await new Promise(resolve =>
                    setTimeout(resolve, 300)
                );
            } catch {}
        }

        if (deleted === 0) {
            return sock.sendMessage(jid, {
                text: t("owner.permission_denied")
            });
        }

        await sock.sendMessage(jid, {
            text:
`${t("admin.purge_deleted")} ${deleted} ${t("admin.purge_messages")}

${t("admin.purge_finished")}`
        });

    }
};
