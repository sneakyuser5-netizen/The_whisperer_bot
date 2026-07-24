const read = require("../../lib/read");
const { t } = require("../../lib/lang");

module.exports = {

    name: "read",

    description: "Enable or disable auto read",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: t("owner.read_usage")
            });

        }

        read.set(
            msg.key.participant || jid,
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                    ? t("owner.read_enabled")
                    : t("owner.read_disabled")
        });

    }

};
