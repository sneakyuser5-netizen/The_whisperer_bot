const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
const identity = require("../../lib/identity");

module.exports = {
    name: "ai",
    description: "Enable or disable automatic AI chat",
    category: "tools",
    permission: "sudo",
    usage: ".ai on\n.ai off\n.ai status",
    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        const option = (args[0] || "").toLowerCase();
        if (!jid) return;

        // In groups, check admin with LID-aware logic + owner bypass
        if (jid.endsWith("@g.us")) {
            if (option === "status") {
                const enabled =!!settings.get(jid).ai;
                return sock.sendMessage(jid, {
                    text: t(jid, enabled? "tools.ai_status_on" : "tools.ai_status_off")
                });
            }

            const metadata = await sock.groupMetadata(jid).catch(()=>null);
            const rawSender = msg.key.participant || msg.participant || identity.getSender(msg) || "";
            const normSender = identity.normalize? identity.normalize(rawSender) : rawSender;

            // Owner bypass
            const isOwner = typeof identity.isOwner === 'function'? identity.isOwner(rawSender) : false;
            const isBotOwner = msg.key.fromMe || isOwner;

            let isAdmin = isBotOwner;

            if (!isAdmin && metadata?.participants) {
                const found = metadata.participants.find(p => {
                    const pid = p.id || p.jid || "";
                    // Direct match (LID), normalized match, or phoneNumber field
                    return pid === rawSender ||
                           pid === normSender ||
                           (identity.normalize && identity.normalize(pid) === normSender) ||
                           (p.phoneNumber && identity.normalize && identity.normalize(p.phoneNumber) === normSender);
                });
                isAdmin =!!found?.admin;
            }

            if (!isAdmin) {
                return sock.sendMessage(jid, { text: t(jid, "admin_only") });
            }
        }

        if (!["on", "off", "status"].includes(option)) {
            return sock.sendMessage(jid, { text: t(jid, "tools.ai_usage") });
        }

        if (option === "status") {
            const enabled =!!settings.get(jid).ai;
            return sock.sendMessage(jid, {
                text: t(jid, enabled? "tools.ai_status_on" : "tools.ai_status_off")
            });
        }

        const enabled = option === "on";
        settings.set(jid, "ai", enabled);

        return sock.sendMessage(jid, {
            text: t(jid, enabled? "tools.ai_enabled" : "tools.ai_disabled")
        });
    }
};
