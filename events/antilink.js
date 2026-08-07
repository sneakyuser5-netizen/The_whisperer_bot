
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

        const action = groupSettings.antilink_action || "delete";

        const metadata = await sock.groupMetadata(jid);

        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

        const bot = metadata.participants.find(
            p => (p.id || p.jid) === botId
        );

        // Bot is no longer an admin
        if (!bot?.admin) {

            settingsLib.set(jid, "antilink", false);

            await sock.sendMessage(jid, {
                text: "⚠️ Anti-link has been disabled because I'm no longer a group administrator."
            });

            return;

        }

        // Sticker lock
        if (
            groupSettings.lock_sticker &&
            msg.message?.stickerMessage
        ) {

            const sender =
                msg.key.participant ||
                msg.key.remoteJid;

            const member = metadata.participants.find(
                p => (p.id || p.jid) === sender
            );

            if (!member?.admin) {

                await sock.sendMessage(jid, {
                    delete: msg.key
                });

                return sock.sendMessage(jid, {
                    text: "🚫 Stickers are currently locked."
                });

            }

        }

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            "";

        const linkRegex =
            /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

        if (!linkRegex.test(text)) return;

        try {

            const sender =
                msg.key.participant ||
                msg.key.remoteJid;

            const member = metadata.participants.find(
                p => (p.id || p.jid) === sender
            );

            // Ignore admins, creator, owner and sudo
            if (
                member?.admin ||
                identity.isBotOwner(msg) ||
                identity.isCreator(msg) ||
                identity.isSudo(msg)
            ) {
                return;
            }

            // Delete the offending message
            await sock.sendMessage(jid, {
                delete: msg.key
            });

            if (action === "warn") {

                const warnings = require("../lib/warnings");

                const count = warnings.add(jid, sender);

                return await sock.sendMessage(jid, {
                    text:
`⚠️ @${sender.split("@")[0]} has been warned.

Warnings: ${count}`,
                    mentions: [sender]
                });

            }

            if (action === "kick") {

                await sock.sendMessage(jid, {
                    text:
`🚫 @${sender.split("@")[0]} was removed for sending links.`,
                    mentions: [sender]
                });

                return await sock.groupParticipantsUpdate(
                    jid,
                    [sender],
                    "remove"
                );

            }

            // Default action: delete only
            await sock.sendMessage(jid, {
                text:
`🚫 @${sender.split("@")[0]}, links are not allowed here.`,
                mentions: [sender]
            });

        } catch (err) {

            console.log("Anti-link error:", err);

        }

    }

};



