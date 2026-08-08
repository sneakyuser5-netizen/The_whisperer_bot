const warns = require("../../lib/warns");
const mute = require("../../lib/mute");
const identity = require("../../lib/identity");
const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "warn",

    description: "Warn a group member",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        let target =
            context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.warn_usage")
            });
        }

        target = identity.normalize(target);

        const mention =
            context?.mentionedJid?.[0] ||
            context?.participant;

        /*
         * Get this group's warning limit.
         *
         * Default = 3
         */
        const groupSettings = settings.get(jid);

        const warnLimit =
            Number(groupSettings.warn_limit) || 3;

        const count =
            warns.add(
                jid,
                target,
                mention
            );

        /*
         * Reached warning limit
         */
        if (count >= warnLimit) {

            await sock.sendMessage(jid, {
                text:
                    `👢 @${target} ${t(jid, "admin.warn_kick")}\n\n` +
                    `${t(jid, "admin.warnings_count")} ${count}/${warnLimit}`,
                mentions: [mention]
            });

            try {

                await sock.groupParticipantsUpdate(
                    jid,
                    [mention],
                    "remove"
                );

            } catch (err) {

                console.log(
                    "Warn kick error:",
                    err
                );

                return sock.sendMessage(jid, {
                    text:
                        t(jid, "admin.warn_kick_failed")
                });
            }

            warns.reset(
                jid,
                target
            );

            return;
        }

        /*
         * Normal warning
         */
        await sock.sendMessage(jid, {
            text:
                `${t(jid, "admin.warn_issued")}\n\n` +
                `${t(jid, "admin.warnings_user")} @${target}\n` +
                `${t(jid, "admin.warnings_count")} ${count}/${warnLimit}`,

            mentions: [mention]
        });

        /*
         * Keep the existing automatic mute
         * when the member reaches 3 warnings,
         * but only if the configured limit is
         * greater than 3.
         */
        if (
            count === 3 &&
            warnLimit > 3
        ) {

            mute.mute(
                jid,
                target,
                30 * 60 * 1000
            );

            await sock.sendMessage(jid, {
                text:
                    `🔇 @${target} ${t(jid, "admin.warn_auto_muted")}`,
                mentions: [mention]
            });
        }

    }

};
