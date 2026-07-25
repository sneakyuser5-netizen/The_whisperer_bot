const settings = require("../../lib/settings");
const { t } = require("../../lib/lang"); // <-- added back

module.exports = {
    name: "autorecording",
    description: "Enable or disable auto recording",
    category: "owner",
    permission: "owner",
    usage: ".autorecording on/off",

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();
        const current = settings.get("global").autorecording? t("owner.on") : t("owner.off");

        // If no arg was given, just show status
        if (!option) {
            return sock.sendMessage(jid, {
                text: `${t("owner.autorecording_status")} ${current}\n\n${t("usage")}:.autorecording on\n${t("usage")}:.autorecording off`
            });
        }

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: `${t("owner.invalid_option")} "${option}"\n${t("owner.use_on_off")}\n${t("owner.current")}: ${current}`
            });
        }

        settings.set("global", "autorecording", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
              ? `✅ ${t("owner.autorecording_enabled")}`
                : `❌ ${t("owner.autorecording_disabled")}`
        });
    }
};
