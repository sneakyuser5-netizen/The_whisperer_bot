const warns = require("../../lib/warns");
const mute = require("../../lib/mute");
const identity = require("../../lib/identity");
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

        target =
            identity.normalize(target);

        const mention =
            context?.mentionedJid?.[0] ||
            context?.participant;

        const count =
            warns.add(jid, target, mention);

        await sock.sendMessage(jid, {

            text:
`${t(jid, "admin.warn_issued")}

${t(jid, "admin.warnings_user")} @${target}

${t(jid, "admin.warnings_count")} ${count}/5`,

            mentions: [mention]

        });

        // 3 warns → mute
        if (count === 3) {

            mute.mute(
                jid,
                target,
                30 * 60 * 1000
            );

            return sock.sendMessage(jid, {

                text:
`🔇 @${target} ${t(jid, "admin.warn_auto_muted")}`,

                mentions: [mention]

            });

        }

        // 4 warns
        if (count === 4) {

            return sock.sendMessage(jid, {

                text:
`⚠️ ${t(jid, "admin.warn_final")} @${target}.\n\n${t(jid, "admin.warn_last_chance")}`,

                mentions: [mention]

            });

        }

        // 5 warns → kick
        if (count >= 5) {

            await sock.sendMessage(jid, {

                text:
`👢 @${target} ${t(jid, "admin.warn_kick")}`,

                mentions: [mention]

            });

            await sock.groupParticipantsUpdate(
                jid,
                [mention],
                "remove"
            );

            warns.reset(
                jid,
                target
            );

        }

    }

};
