const warns = require("../../lib/warns");
const mute = require("../../lib/mute");
const identity = require("../../lib/identity");

module.exports = {

    name: "warn",

    description: "Warn a group member",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
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
                text:
"❌ Reply to a user or mention them.\n\nExample:\n.warn @user"
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
`⚠️ Warning issued

User: @${target}

Warnings: ${count}/5`,

            mentions: [context?.mentionedJid?.[0] || context?.participant]

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
`🔇 @${target} has been automatically muted for 30 minutes.

😂 Time to cool off a little.`,

                mentions: [
                    context?.mentionedJid?.[0] ||
                    context?.participant
                ]

            });

        }


        // 4 warns
        if (count === 4) {

            return sock.sendMessage(jid, {

                text:
`⚠️ Final warning for @${target}.

🚨 One more warning and WhisperBot will remove you.`,

                mentions: [
                    context?.mentionedJid?.[0] ||
                    context?.participant
                ]

            });

        }


        // 5 warns → kick
        if (count >= 5) {

            await sock.sendMessage(jid, {

                text:
`👢 @${target} reached the maximum warnings.

😂 WhisperBot has escorted them to the exit.`,

                mentions: [
                    context?.mentionedJid?.[0] ||
                    context?.participant
                ]

            });

            await sock.groupParticipantsUpdate(
                jid,
                [
                    context?.mentionedJid?.[0] ||
                    context?.participant
                ],
                "remove"
            );

            warns.reset(
                jid,
                target
            );

        }

    }

};
