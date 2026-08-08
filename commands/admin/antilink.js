const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "antilink",

    description: "Enable or disable anti-link",

    category: "admin",

    permission: "admin",

    usage: ".antilink on/off | action delete/warn/kick",

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
         * .antilink on/off
         */
        if (["on", "off"].includes(option)) {

            settings.set(
                jid,
                "antilink",
                option === "on"
            );

            return await sock.sendMessage(jid, {
                text:
                    option === "on"
                        ? t(jid, "antilink_enabled")
                        : t(jid, "antilink_disabled")
            });
        }

        /*
         * .antilink action delete/warn/kick
         */
        if (option === "action") {

            const action = args[1]?.toLowerCase();

            if (!["delete", "warn", "kick"].includes(action)) {

                return await sock.sendMessage(jid, {
                    text: t(jid, "antilink_action_usage")
                });

            }

            settings.set(
                jid,
                "antilink_action",
                action
            );

            return await sock.sendMessage(jid, {
                text: t(jid, "antilink_action_set")
                    .replace("{action}", action)
            });
        }

        return await sock.sendMessage(jid, {
            text: t(jid, "antilink_usage")
        });
    }

};
