const { t } = require("../../lib/lang");

module.exports = {

    name: "purge",

    description: "Delete recent messages",

    category: "admin",

    permission: "admin",

    usage: ".purge 10",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid =
            msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });

        }

        const amount =
            Number(args[0]);

        if (
            isNaN(amount) ||
            amount < 1 ||
            amount > 100
        ) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.purge_usage")
            });

        }

        const context =
            msg.message?.extendedTextMessage
            ?.contextInfo;

        if (!context?.stanzaId) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.purge_reply")
            });

        }

        const messages =
            global.messageCache?.[jid];

        if (!messages) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.purge_no_history")
            });

        }

        const index =
            messages.findIndex(
                m => m.key.id === context.stanzaId
            );

        if (index === -1) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.purge_not_found")
            });

        }

        const selected =
            messages.slice(
                Math.max(0, index - amount),
                index + 1
            );

        for (const m of selected) {

            await sock.sendMessage(jid, {
                delete: m.key
            });

        }

        await sock.sendMessage(jid, {
            text:
`${t(jid, "admin.purge_deleted")} ${selected.length} ${t(jid, "admin.purge_messages")}

${t(jid, "admin.purge_finished")}`
        });

    }

};
