const { t } = require("../../lib/lang");
const send = require("../../lib/send");
const autowelcome = require("../../lib/autowelcome");

module.exports = {

    name: "setwelcome",

    description: "Set the private welcome message",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!args.length) {

            return send(sock, jid, {
                text: t(jid, "owner.setwelcome_usage")
            });

        }

        const message = args.join(" ");

        autowelcome.setMessage(message);

        await send(sock, jid, {
            text: t(jid, "owner.setwelcome_success")
        });

    }

};
