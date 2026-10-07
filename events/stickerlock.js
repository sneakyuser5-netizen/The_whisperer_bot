const { t } = require("../lib/lang");

module.exports = {

    name: "stickerlock",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        if (!msg.message) return;

        const jid = msg.key.remoteJid;

        if (!jid?.endsWith("@g.us")) return;

        const settings = require("../lib/settings");

        const groupSettings = settings.get(jid);

        if (groupSettings.lock_sticker !== true) return;

        if (!msg.message.stickerMessage) return;

        const metadata =
            await sock.groupMetadata(jid);

        const sender =
            msg.key.participant ||
            msg.key.participantAlt;

        if (!sender) return;

        const normalizeId = (id = "") =>
            String(id)
                .trim()
                .replace("@s.whatsapp.net", "")
                .replace("@lid", "")
                .replace(/:\d+$/, "");

        const normalizedSender =
            normalizeId(sender);

        const member =
            metadata.participants.find(p => {

                const ids = [
                    p.id,
                    p.jid,
                    p.participant,
                    p.participantAlt,
                    p.phoneNumber
                ]
                    .filter(Boolean)
                    .map(normalizeId);

                return ids.includes(normalizedSender);
            });

        // Admins are never affected.
        if (member?.admin) return;

        try {

            await sock.sendMessage(jid, {
                delete: msg.key
            });

            await sock.sendMessage(jid, {
                text: t(jid, "message_type_locked").replace("{type}", "sticker")
            });

        } catch (err) {

            console.log(
                "Sticker-lock error:",
                err
            );
        }
    }
};
