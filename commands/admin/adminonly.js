const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "adminonly",

    description: "Allow only group admins to send messages",

    category: "admin",

    permission: "admin",

    usage: ".adminonly on/off/status",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "group_only")
            });
        }

        const option = args[0]?.toLowerCase();

        /*
         * Enable / disable Admin-Only mode.
         */
        if (option === "on" || option === "off") {

            const enabled = option === "on";

            settings.set(
                jid,
                "adminonly",
                enabled
            );

            return sock.sendMessage(jid, {
                text: t(
                    jid,
                    enabled
                        ? "admin.adminonly_enabled"
                        : "admin.adminonly_disabled"
                )
            });
        }

        /*
         * Show current status.
         */
        if (option === "status") {

            const enabled =
                settings.get(jid).adminonly === true;

            return sock.sendMessage(jid, {
                text: t(
                    jid,
                    enabled
                        ? "admin.adminonly_status_on"
                        : "admin.adminonly_status_off"
                )
            });
        }

        /*
         * Invalid option.
         */
        return sock.sendMessage(jid, {
            text: t(jid, "admin.adminonly_usage")
        });
    }

};
