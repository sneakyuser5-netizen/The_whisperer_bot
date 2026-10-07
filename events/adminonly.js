const settings = require("../lib/settings");
const identity = require("../lib/identity");

module.exports = {

    name: "adminonly",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        if (!msg?.message) return;

        // Ignore messages sent by the bot itself.
        if (msg.key?.fromMe) return;

        const jid = msg.key?.remoteJid;

        if (!jid || !jid.endsWith("@g.us")) return;

        const groupSettings = settings.get(jid);

        if (groupSettings.adminonly !== true) return;

        try {

            const metadata =
                await sock.groupMetadata(jid);

            /*
             * Identify the sender.
             *
             * In Baileys v7 the sender may be represented
             * by participant, participantAlt, or a LID.
             */
            const sender =
                msg.key?.participant ||
                msg.key?.participantAlt;

            if (!sender) {
                console.log(
                    "ADMINONLY: Unable to identify sender."
                );
                return;
            }

            const normalizeId = (id = "") => {
                return String(id)
                    .trim()
                    .replace("@s.whatsapp.net", "")
                    .replace("@lid", "")
                    .replace(/:\d+$/, "")
                    .trim();
            };

            const normalizedSender =
                normalizeId(sender);

            /*
             * Find the sender in the group participant list.
             */
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

                    return ids.includes(
                        normalizedSender
                    );
                });

            /*
             * Admins are always allowed to send.
             */
            if (member?.admin) {
                return;
            }

            /*
             * Find the bot itself.
             *
             * The bot may appear as a LID in the group
             * while sock.user.id contains its phone number.
             */
            const botId =
                normalizeId(
                    sock.user?.id ||
                    sock.user?.lid ||
                    ""
                );

            const bot =
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

                    return ids.includes(botId);
                });

            /*
             * Bot must be a group administrator.
             */
            if (!bot?.admin) {

                console.log(
                    "ADMINONLY: Bot is not an admin in",
                    jid
                );

                return;
            }

            /*
             * Delete the non-admin message.
             */
            await sock.sendMessage(jid, {
                delete: msg.key
            });

            console.log(
                "ADMINONLY: Deleted message from",
                sender
            );

        } catch (err) {

            console.log(
                "ADMINONLY ERROR:",
                err.message
            );

        }
    }
};
