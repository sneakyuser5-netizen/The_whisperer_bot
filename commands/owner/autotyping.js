const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "autotyping",
    description: "Enable or disable auto typing",
    category: "owner",
    permission: "owner",
    usage: ".autotyping on/off",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        const option = args[0]?.toLowerCase();
        const isOn = settings.get("global").autotyping;

        // Show status if no option given - but reuse the usage key
        if (!option) {
            return sock.sendMessage(jid, {
                text: `${isOn? t("owner.on") : t("owner.off")}\n\n${t("owner.autotyping_usage")}`
            });
        }

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t("owner.autotyping_usage")
            });
        }

        settings.set("global", "autotyping", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
              ? t("owner.autotyping_enabled")
               : t("owner.autotyping_disabled")
        });
    }
};
