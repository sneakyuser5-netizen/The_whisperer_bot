const mute = require("../../lib/mute");

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
                text: "❌ This command only works in groups."
            });
        }


        const mentioned =
            msg.message.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid;


        if (!mentioned || !mentioned[0]) {
            return sock.sendMessage(jid, {
                text: "❌ Mention a user.\nExample: .mute @user 10m"
            });
        }


const identity = require("../../lib/identity");

const target =
    identity.normalize(
        mentioned[0]
    );

        const duration = args[1];

        const match =
            duration.match(/^(\d+)(m|h|d)$/);


        if (!match) {
            return sock.sendMessage(jid, {
                text:
                "❌ Invalid time.\nUse:\n10m = minutes\n1h = hours\n1d = days"
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
`🔇 @${target.split("@")[0]} has been muted for ${duration}.`,
            mentions: [target]
        });

    }

};
