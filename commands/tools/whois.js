const { t } = require("../../lib/lang");

module.exports = {

    name: "whois",

    description: "Show chat information",

    category: "tools",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        let text =
`${t("tools.whois_title")}

${t("tools.whois_jid")}
${jid}

${t("tools.whois_type")}
${jid.endsWith("@g.us") ? t("tools.whois_group") : t("tools.whois_private")}

${t("tools.whois_fromme")}
${msg.key.fromMe ? t("yes") : t("no")}`;

        if (jid.endsWith("@g.us")) {

            const meta = await sock.groupMetadata(jid);

            text +=
`\n\n${t("tools.whois_group_name")}
${meta.subject}

${t("tools.whois_members")}
${meta.participants.length}`;

        }

        await sock.sendMessage(jid, {
            text
        });

    }

};
