const settings = require("../../lib/settings");

module.exports = {

    name: "goodbye",

    description: "Enable or disable goodbye messages",

    category: "admin",

    permission: "admin",

    usage: ".goodbye on/off",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: "Usage:\n.goodbye on\n.goodbye off"
            });

        }

        settings.set(
            jid,
            "goodbye",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                    ? "✅ Goodbye messages enabled."
                    : "✅ Goodbye messages disabled."
        );

    }

};
