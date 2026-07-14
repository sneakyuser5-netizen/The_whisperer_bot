const mute = require("../../lib/mute");
const identity = require("../../lib/identity");

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
                text: "❌ This command only works in groups."
            });
        }


        const mentioned =
            msg.message.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid;


        if (!mentioned || !mentioned[0]) {
            return sock.sendMessage(jid, {
                text: "❌ Mention a user.\nExample: .unmute @user"
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
                text:
                `ℹ️ @${target.split("@")[0]} is not muted.`,
                mentions: [target]
            });
        }


        await sock.sendMessage(jid, {
            text:
            `🔊 @${target.split("@")[0]} has been unmuted.`,
            mentions: [target]
        });

    }

};
