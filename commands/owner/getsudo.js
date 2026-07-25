const sudo = require("../../lib/sudo");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "getsudo",

    description: "Show sudo members",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const owner =
            identity.getBotOwner();

        const users =
            sudo.all(owner);

        if (!users.length) {

            return sock.sendMessage(jid, {
                text: t("owner.getsudo_empty")
            });

        }

        let text =
`${t("owner.getsudo_title")}

`;

        for (const user of users) {

            text += `• @${user}\n`;

        }

        await sock.sendMessage(jid, {
            text,
            mentions: users.map(
                u => `${u}@lid`
            )
        });

    }

};
