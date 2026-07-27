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
                text: t("admin.only_groups") // FIXED: removed jid
            });
        }

        // CHECK IF BOT IS ADMIN
        const metadata = await sock.groupMetadata(jid);
        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botData = metadata.participants.find(p => p.id === botId);

        if (!botData ||!botData.admin) {
            return sock.sendMessage(jid, {
                text: t("owner.permission_denied") // USE EXISTING KEY
            });
        }

        const amount = Number(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_usage") // FIXED
            });
        }

        const context = msg.message?.extendedTextMessage?.contextInfo;

        if (!context?.stanzaId) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_reply") // FIXED
            });
        }

        const messages = global.messageCache?.[jid];

        if (!messages) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_no_history") // FIXED
            });
        }

        const index = messages.findIndex(m => m.key.id === context.stanzaId);

        if (index === -1) {
            return sock.sendMessage(jid, {
                text: t("admin.purge_not_found") // FIXED
            });
        }

        const selected = messages.slice(Math.max(0, index - amount + 1), index + 1);
        let deleted = 0;

        for (const m of selected) {
            try {
                await sock.sendMessage(jid, { delete: m.key });
                deleted++;
                await new Promise(r => setTimeout(r, 300)); // avoid spam
            } catch (e) {}
        }

        await sock.sendMessage(jid, {
            text: `${t("admin.purge_deleted")} ${deleted} ${t("admin.purge_messages")}\n\n${t("admin.purge_finished")}` // FIXED
        });
    }
};
