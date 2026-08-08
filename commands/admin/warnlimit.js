const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "warnlimit",

    description: "Set the maximum warnings before a member is removed",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        /*
         * Support both:
         *
         * .warnlimit 3
         * .warnlimit=3
         */
        let value = args.join(" ").trim();

        if (value.startsWith("=")) {
            value = value.slice(1).trim();
        }

        const limit = parseInt(value, 10);

        if (!Number.isInteger(limit) || limit < 1) {
            return sock.sendMessage(jid, {
                text:
                    t(jid, "admin.warnlimit_usage")
            });
        }

        settings.set(
            jid,
            "warn_limit",
            limit
        );

        await sock.sendMessage(jid, {
            text:
                t(jid, "admin.warnlimit_set")
                    .replaceAll("{limit}", limit)
        });

    }

};
