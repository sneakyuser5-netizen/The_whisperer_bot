const status = require("../../lib/status");

module.exports = {

    name: "status",

    description: "Enable or disable status saving",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("owner.status_usage")
            });

        }


        status.set(
            msg.key.participant || jid,
            option === "on"
        );


        await sock.sendMessage(jid, {
            text:
option === "on"
    ? t("owner.status_enabled")
    : t("owner.status_disabled")
        });

    }

};
