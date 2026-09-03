const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
const { isGroupAdmin } = require("../../lib/group-admin");

module.exports = {
    name: "autogoodnight",
    description: "Enable or disable automatic good-night replies",
    category: "tools",
    permission: "public",
    usage: ".autogoodnight on\n.autogoodnight off\n.autogoodnight status",

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
                text: t(jid, "tools.autogoodnight_usage")
            });
        }

        const admin = await isGroupAdmin(sock, msg);

        if (!admin) {
            console.log(
                `[AUTOGOODNIGHT] Admin check failed. Sender: ${
                    msg.key.participant || "unknown"
                }`
            );

            return sock.sendMessage(jid, {
                text: t(jid, "admin_only")
            });
        }

        if (option === "status") {
            const enabled = !!settings.get(jid).autogoodnight;

            return sock.sendMessage(jid, {
                text: t(
                    jid,
                    enabled
                        ? "tools.autogoodnight_status_on"
                        : "tools.autogoodnight_status_off"
                )
            });
        }

        const enabled = option === "on";

        settings.set(jid, "autogoodnight", enabled);

        return sock.sendMessage(jid, {
            text: t(
                jid,
                enabled
                    ? "tools.autogoodnight_enabled"
                    : "tools.autogoodnight_disabled"
            )
        });
    }
};
