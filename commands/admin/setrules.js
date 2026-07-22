const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {

    name: "setrules",

    description: "Set group rules",

    category: "admin",

    permission: "admin",

    usage: ".setrules",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        const args = body.split(" ").slice(1);

        const rules = args.join(" ");


        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("admin.only_groups")
            });
        }



        const group = settings.get("groups")[jid] || {};

        group.rules = rules;

        settings.set("groups", {
            ...settings.get("groups"),
            [jid]: group
        });


        await sock.sendMessage(jid, {
            text: t("admin.setrules_updated")
        });

    }
};
