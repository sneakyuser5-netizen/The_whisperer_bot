const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "autorecording",
    description: "Enable or disable auto recording",
    category: "owner",
    permission: "owner",
    usage: ".autorecording on/off",

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;
        const option = args[0]?.toLowerCase();
        const isOn = settings.get("global").autorecording;

        // No arg = show status
        if (!option) {
            return sock.sendMessage(jid, {
                text: `${t("owner.autorecording_status")}: ${isOn? t("owner.on") : t("owner.off")}\n\n${t("owner.usage")}:.autorecording on\n${t("owner.usage")}:.autorecording off`
            });
        }

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: `${t("owner.invalid_option")}: "${option}"\n${t("owner.use_on_off")}\n${t("owner.current")}: ${isOn? t("owner.on") : t("owner.off")}`
            });
        }

        settings.set("global", "autorecording", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
             ? `✅ ${t("owner.autorecording_enabled")}\n${t("owner.autorecording_note")}`
                : `❌ ${t("owner.autorecording_disabled")}`
        });
    }
};
