const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
const identity = require("../../lib/identity");

module.exports = {
    name: "autoreact",
    aliases: ["ar"],
    description: "Automatically react to messages",
    category: "tools",
    permission: "public",
    usage: ".autoreact on\n.autoreact off\n.autoreact status",

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        const option = (args[0] || "").toLowerCase();

        if (!jid) return;

        // Groups: only admins can change autoreact.
        if (jid.endsWith("@g.us")) {
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
                text: t(jid, "tools.autoreact_usage")
            });
        }

        const enabled = !!settings.get(jid).autoreact;

        if (option === "status") {
            return sock.sendMessage(jid, {
                text: t(
                    jid,
                    enabled
                        ? "tools.autoreact_status_on"
                        : "tools.autoreact_status_off"
                )
            });
        }

        const value = option === "on";

        settings.set(jid, "autoreact", value);

        return sock.sendMessage(jid, {
            text: t(
                jid,
                value
                    ? "tools.autoreact_enabled"
                    : "tools.autoreact_disabled"
            )
        });
    }
};
