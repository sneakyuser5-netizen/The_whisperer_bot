const sudo = require("../../lib/sudo");
const identity = require("../../lib/identity");
const { t } = require("../../lib/lang");

module.exports = {

    name: "delsudo",

    description: "Remove a sudo member",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        let target =
            context?.mentionedJid?.[0] ||
            context?.participant;

        if (!target) {

            return sock.sendMessage(jid, {
                text: t("owner.delsudo_usage")
            });

        }

        sudo.remove(
            identity.getBotOwner(),
            target
        );

        await sock.sendMessage(jid, {
            text:
`${t("owner.delsudo_success")}

${t("owner.user")}
@${target.split("@")[0]}`,
            mentions: [target]
        });

    }

};
