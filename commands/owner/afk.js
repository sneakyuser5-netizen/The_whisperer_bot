const afk = require("../../lib/afk");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "afk",

    description: "Set yourself AFK",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const sender = identity.getSender(msg);

        const reason =
            args.join(" ") ||
            t("owner.afk_no_reason");

        afk.set(sender, reason);

        await sock.sendMessage(jid, {

            text:
`${t("owner.afk_set")}

📝 ${t("owner.reason")}
${reason}

😂 ${t("owner.afk_footer")}`

        });

    }

};
