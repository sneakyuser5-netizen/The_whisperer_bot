const mute = require("../../lib/mute");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "unmute",

    description: "Unmute a member",

    category: "admin",

    permission: "admin",

    usage: ".unmute @user",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const mentioned =
            msg.message.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid;

        if (!mentioned || !mentioned[0]) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.unmute_usage")
            });
        }

        const target =
            identity.normalize(
                mentioned[0]
            );

        const removed = mute.unmute(
            jid,
            target
        );

        if (!removed) {
            return sock.sendMessage(jid, {
                text: `ℹ️ @${target.split("@")[0]} ${t(jid, "admin.unmute_not_muted")}`,
                mentions: [target]
            });
        }

        await sock.sendMessage(jid, {
            text: `🔊 @${target.split("@")[0]} ${t(jid, "admin.unmute_success")}`,
            mentions: [target]
        });

    }

};
