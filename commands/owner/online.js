const { t } = require("../../lib/lang");

module.exports = {

    name: "online",

    description: "Enable or disable always online",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("owner.online_usage")
            });

        }

        if (option === "on") {

            await sock.sendPresenceUpdate(
                "available"
            );

            await sock.sendMessage(jid, {
                text: t("owner.online_enabled")
            });

        } else {

            await sock.sendPresenceUpdate(
                "unavailable"
            );

            await sock.sendMessage(jid, {
                text: t("owner.online_disabled")
            });

        }

    }

};
