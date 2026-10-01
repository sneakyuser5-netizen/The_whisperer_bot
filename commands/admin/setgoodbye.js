const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");
module.exports = {
    name: "setgoodbye",
    description: "Set the goodbye message",
    category: "admin",
    permission: "admin",
    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: t(jid, "admin.only_groups") });
        const message = args.join(" ").trim();
        if (!message) return sock.sendMessage(jid, { text: t(jid, "admin.setgoodbye_usage") });

        settings.set(jid, "goodbye_message", message);
        settings.set(jid, "goodbye", true);
        await sock.sendMessage(jid, { text: t(jid, "admin.setgoodbye_saved") });
    }
};
