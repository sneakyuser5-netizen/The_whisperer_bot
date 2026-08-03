const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {
    name: "setgoodbye",
    description: "Set the goodbye message",
    category: "admin",
    permission: "admin",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t("group_only")
            });
        }

        const message = args.join(" ").trim();

        if (!message) {
            return sock.sendMessage(jid, {
                text: t("admin.setgoodbye_usage")
            });
        }

        settings.set(jid, "goodbye_message", message);

        await sock.sendMessage(jid, {
            text: t("admin.setgoodbye_saved")
        });

    }
};
