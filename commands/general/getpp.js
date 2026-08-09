const { t } = require("../../lib/lang");

module.exports = {

    name: "getpp",

    description: "Get a user's profile picture",

    category: "general",

    permission: "public",

    usage: ".getpp [@user]",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        try {

            const context =
                msg.message?.extendedTextMessage?.contextInfo;

            /*
             * Determine target:
             * 1. Mentioned user
             * 2. Replied user
             * 3. Sender himself
             */
            const target =
                context?.mentionedJid?.[0] ||
                context?.participant ||
                msg.key.participant ||
                msg.key.remoteJid;

            if (!target) {
                return sock.sendMessage(jid, {
                    text: t(jid, "general.getpp_failed")
                });
            }

            /*
             * Get profile picture URL.
             */
            const ppUrl =
                await sock.profilePictureUrl(
                    target,
                    "image"
                );

            if (!ppUrl) {
                return sock.sendMessage(jid, {
                    text: t(jid, "general.getpp_unavailable")
                });
            }

            /*
             * Send the profile picture.
             */
            await sock.sendMessage(
                jid,
                {
                    image: {
                        url: ppUrl
                    },
                    caption:
                        t(jid, "general.getpp_caption")
                },
                {
                    quoted: msg
                }
            );

        } catch (err) {

            console.log(
                "Get profile picture error:",
                err
            );

            await sock.sendMessage(jid, {
                text:
                    t(
                        jid,
                        "general.getpp_unavailable"
                    )
            });
        }

    }

};
