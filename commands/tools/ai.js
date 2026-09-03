const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
const identity = require("../../lib/identity");

module.exports = {
    name: "ai",

    description: "Enable or disable automatic AI chat",

    category: "tools",

    permission: "public",

    usage: ".ai on\n.ai off\n.ai status",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;
        const option = (args[0] || "").toLowerCase();

        if (!jid) return;

        // In groups, only admins may change automatic AI mode.
        if (jid.endsWith("@g.us")) {

            if (option === "status") {
                const enabled = !!settings.get(jid).ai;

                return sock.sendMessage(jid, {
                    text: t(
                        jid,
                        enabled
                            ? "tools.ai_status_on"
                            : "tools.ai_status_off"
                    )
                });
            }

            const metadata = await sock.groupMetadata(jid);
            const sender = identity.getSender(msg);

            const member = metadata.participants.find(p => {
                const id = identity.normalize(p.id || p.jid || "");
                return id === identity.normalize(sender || "");
            });

            if (!member?.admin) {
                return sock.sendMessage(jid, {
                    text: t(jid, "admin_only")
                });
            }
        }

        if (!["on", "off", "status"].includes(option)) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.ai_usage")
            });
        }

        if (option === "status") {
            const enabled = !!settings.get(jid).ai;

            return sock.sendMessage(jid, {
                text: t(
                    jid,
                    enabled
                        ? "tools.ai_status_on"
                        : "tools.ai_status_off"
                )
            });
        }

        const enabled = option === "on";

        settings.set(jid, "ai", enabled);

        return sock.sendMessage(jid, {
            text: t(
                jid,
                enabled
                    ? "tools.ai_enabled"
                    : "tools.ai_disabled"
            )
        });
    }
};
