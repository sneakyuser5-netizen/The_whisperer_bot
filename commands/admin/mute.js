const mute = require("../../lib/mute");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "mute",

    description: "Mute a member temporarily",

    category: "admin",

    permission: "admin",

    usage: ".mute @user 10m",

    minArgs: 2,

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
                text: t(jid, "admin.mute_mention")
            });
        }

        const target =
            identity.normalize(
                mentioned[0]
            );

        const duration = args[1];

        const match =
            duration.match(/^(\d+)(m|h|d)$/);

        if (!match) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.mute_invalid_time")
            });
        }

        const value = Number(match[1]);
        const unit = match[2];

        let ms = value * 60 * 1000;

        if (unit === "h") {
            ms = value * 60 * 60 * 1000;
        }

        if (unit === "d") {
            ms = value * 24 * 60 * 60 * 1000;
        }

        mute.mute(
            jid,
            target,
            ms
        );

        await sock.sendMessage(jid, {
            text:
`${t(jid, "admin.mute_muted_emoji")} @${target.split("@")[0]} ${t(jid, "admin.mute_muted_for")} ${duration}.`,
            mentions: [target]
        });

    }

};
