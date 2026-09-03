const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "rules",

    description: "Show group rules",

    category: "general",

    usage: ".rules",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });

        }

        const data = settings.get(jid);

        if (!data.rules) {

            return sock.sendMessage(jid, {

                text: t("general.rules_none")

            });

        }

        await sock.sendMessage(jid, {

            text:
`${t("general.rules_title")}

${data.rules}

${t("general.rules_footer")}`

        });

    }

};
