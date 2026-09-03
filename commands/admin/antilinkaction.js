const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "antilinkaction",
    description: "Configure anti-link action",
    category: "admin",
    permission: "admin",

    usage: ".antilinkaction delete|warn|kick",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const action = args[0].toLowerCase();

        if (!["delete", "warn", "kick"].includes(action)) {

            return sock.sendMessage(jid, {
                text: t(jid, "admin.antilink_action_usage")
            });

        }

        settings.set(jid, "antilink_action", action);

        await sock.sendMessage(jid, {
            text: t(jid, "admin.antilink_action_set")
                .replace("{action}", action)
        });

    }

};
