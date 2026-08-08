module.exports = {

    name: "antilink",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        if (!msg.message) return;

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) return;

        const settingsLib = require("../lib/settings");
        const identity = require("../lib/identity");

        const groupSettings = settingsLib.get(jid);

        if (!groupSettings.antilink) return;

        const action =
            groupSettings.antilink_action || "delete";

        try {

            const metadata =
                await sock.groupMetadata(jid);

            /*
             * Make sure the bot is still an administrator.
             */
            const botId =
                sock.user.id.split(":")[0];

            const bot = metadata.participants.find(p => {

                const ids = [
                    p.id,
                    p.jid,
                    p.participant,
                    p.phoneNumber
                ].filter(Boolean);

                return ids.some(id =>
                    String(id).includes(botId)
                );
            });

            if (!bot?.admin) {

                settingsLib.set(
                    jid,
                    "antilink",
                    false
                );

                console.log(
                    "Anti-link disabled: bot is no longer admin in",
                    jid
                );

                return;
            }

            /*
             * Sticker lock
             */
            if (
                groupSettings.lock_sticker &&
                msg.message?.stickerMessage
            ) {

                const sender =
                    msg.key.participant ||
                    msg.key.participantAlt;

                if (!sender) return;

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
                            .map(String);

                        return ids.includes(String(sender));
                    });

                if (!member?.admin) {

                    await sock.sendMessage(jid, {
                        delete: msg.key
                    });

                    await sock.sendMessage(jid, {
                        text:
                            "🚫 Stickers are currently locked."
                    });
                }

                return;
            }

            /*
             * Extract message text.
             */
            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption ||
                "";

            /*
             * Detect links.
             */
            const linkRegex =
                /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

            if (!linkRegex.test(text)) return;

            /*
             * IMPORTANT:
             * Never fall back to remoteJid here.
             *
             * In a group, remoteJid is the GROUP ID,
             * not the person who sent the message.
             */
            const sender =
                msg.key.participant ||
                msg.key.participantAlt;

            if (!sender) {

                console.log(
                    "Anti-link: unable to identify sender."
                );

                return;
            }

            /*
             * Find the actual participant.
             */
            const senderString =
                String(sender);

            const normalizeId = (id = "") => {

                return String(id)
                    .trim()
                    .replace("@s.whatsapp.net", "")
                    .replace("@lid", "")
                    .replace(/:\d+$/, "");
            };

            const normalizedSender =
                normalizeId(senderString);

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
             * ADMIN CHECK
             *
             * Group admins must NEVER be affected
             * by anti-link.
             */
            if (member?.admin) {
                return;
            }

            /*
             * Protect owner / creator / sudo.
             */
            if (
                identity.isBotOwner(msg) ||
                identity.isCreator(msg) ||
                identity.isSudo(msg)
            ) {
                return;
            }

            /*
             * Use the participant JID from metadata
             * when possible.
             *
             * This prevents accidentally using the
             * group JID as the mention/target.
             */
            const target =
                member?.id ||
                member?.jid ||
                member?.participant ||
                sender;

            /*
             * DELETE MESSAGE
             *
             * All anti-link actions remove the
             * offending link first.
             */
            await sock.sendMessage(jid, {
                delete: msg.key
            });

            /*
             * WARN
             */
            if (action === "warn") {

                const warns =
                    require("../lib/warns");

                const count =
                    warns.add(
                        jid,
                        normalizeId(target),
                        target
                    );

                /*
                 * 3 warnings = kick.
                 */
const warnLimit =
    Number(groupSettings.warn_limit) || 3;

if (count >= warnLimit) {
                    await sock.sendMessage(jid, {
                        text:
                            `👢 @${normalizeId(target)} was removed after receiving 3 warnings.`,
                        mentions: [target]
                    });

                    try {

                        await sock.groupParticipantsUpdate(
                            jid,
                            [target],
                            "remove"
                        );

                    } catch (err) {

                        console.log(
                            "Anti-link warning kick error:",
                            err
                        );
                    }

                    warns.reset(
                        jid,
                        normalizeId(target)
                    );

                    return;
                }

                await sock.sendMessage(jid, {
                    text:
                        `⚠️ @${normalizeId(target)} has been warned.\n\nWarnings: ${count}/${warnLimit}`,
                    mentions: [target]
                });

                return;
            }

            /*
             * KICK
             */
            if (action === "kick") {

                await sock.sendMessage(jid, {
                    text:
                        `🚫 @${normalizeId(target)} was removed for sending links.`,
                    mentions: [target]
                });

                try {

                    await sock.groupParticipantsUpdate(
                        jid,
                        [target],
                        "remove"
                    );

                } catch (err) {

                    console.log(
                        "Anti-link kick error:",
                        err
                    );
                }

                return;
            }

            /*
             * DELETE ONLY
             */
            await sock.sendMessage(jid, {
                text:
                    `🚫 @${normalizeId(target)}, links are not allowed here.`,
                mentions: [target]
            });

        } catch (err) {

            console.log(
                "Anti-link error:",
                err
            );
        }

    }

};
