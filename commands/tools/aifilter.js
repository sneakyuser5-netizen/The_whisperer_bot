const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
const { isGroupAdmin } = require("../../lib/group-admin");

module.exports = {
    name: "aifilter",
    description: "Enable or disable AI message filtering",
    category: "tools",
    permission: "public",
    usage: ".aifilter on\n.aifilter off\n.aifilter status",

    execute: async (sock, msg, args = []) => {
        const jid = msg?.key?.remoteJid;
        const option = (args[0] || "").toLowerCase();

        if (!jid) return;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin_only")
            });
        }

        if (!["on", "off", "status"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.aifilter_usage")
            });
        }

        const admin = await isGroupAdmin(sock, msg);

        if (!admin) {
            console.log(
                `[AIFILTER] Admin check failed. Sender: ${
                    msg.key.participant || "unknown"
                }`
            );

            return sock.sendMessage(jid, {
                text: t(jid, "admin_only")
            });
        }

        if (option === "status") {
            const enabled = !!settings.get(jid).aifilter;

            return sock.sendMessage(jid, {
                text: t(
                    jid,
                    enabled
                        ? "tools.aifilter_status_on"
                        : "tools.aifilter_status_off"
                )
            });
        }

        const enabled = option === "on";

        settings.set(jid, "aifilter", enabled);

        return sock.sendMessage(jid, {
            text: t(
                jid,
                enabled
                    ? "tools.aifilter_enabled"
                    : "tools.aifilter_disabled"
            )
        });
    }
};
