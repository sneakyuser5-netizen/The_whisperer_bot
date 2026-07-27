const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "prefix",
    description: "Change bot prefix",
    category: "owner",
    permission: "owner",
    usage: ".prefix ! or .prefix=!",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;

        if (!args.length) {
            const current = settings.get(jid).prefix || ".";
            return sock.sendMessage(jid, {
                text: t("prefix_current")
                    .replace("{prefix}", current)
            });
        }

        const newPrefix = args[0].trim();

        if (newPrefix.length > 3) {
            return sock.sendMessage(jid, {
                text: t("prefix_too_long")
            });
        }

        if (newPrefix.includes(" ")) {
            return sock.sendMessage(jid, {
                text: t("prefix_no_space")
            });
        }

        settings.set(jid, "prefix", newPrefix);

        return sock.sendMessage(jid, {
            text: t("prefix_changed")
                .replace("{prefix}", newPrefix)
        });
    }
};
