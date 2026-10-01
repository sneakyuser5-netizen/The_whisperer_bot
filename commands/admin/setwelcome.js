const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
module.exports = {
    name: "setwelcome",
    description: "Set the welcome message",
    category: "admin",
    permission: "admin",
    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: t(jid, "admin.only_groups") });
        const message = args.join(" ").trim();
        if (!message) return sock.sendMessage(jid, { text: t(jid, "admin.setwelcome_usage") });

        settings.set(jid, "welcome_message", message);
        settings.set(jid, "welcome", true);
        await sock.sendMessage(jid, { text: t(jid, "admin.setwelcome_saved") });
    }
};
