const settings = require("../../lib/settings");

module.exports = {

    name: "welcome",

    description: "Enable or disable welcome messages",

    category: "admin",

    permission: "admin",

    usage: ".welcome on/off",

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
                text: "Usage:\n.welcome on\n.welcome off"
            });

        }

        settings.set(
            jid,
            "welcome",
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                    ? "✅ Welcome messages enabled."
                    : "✅ Welcome messages disabled."
        });

    }

};
