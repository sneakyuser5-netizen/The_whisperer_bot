const { t } = require("../../lib/lang");
const send = require("../../lib/send");
const autowelcome = require("../../lib/autowelcome");

module.exports = {

    name: "delwelcome",

    description: "Delete the private welcome message",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        autowelcome.clearMessage();

        await send(sock, jid, {
            text: t(jid, "owner.delwelcome_success")
        });

    }

};
