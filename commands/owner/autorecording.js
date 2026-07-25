const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {
    name: "autorecording",
    description: "Enable or disable auto recording",
    category: "owner",
    permission: "owner",
    usage: ".autorecording on/off",

    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        // GET ARGS FROM MESSAGE DIRECTLY
        const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim();
        const args = body.split(/ +/).slice(1); // removes.autorecording
        const option = args[0]?.toLowerCase();

        const current = settings.get("global").autorecording? "ON" : "OFF";

        if (!option) {
            return sock.sendMessage(jid, {
                text: `*Usage:*.autorecording on\n*Usage:*.autorecording off\nCurrent: ${current}`
            });
        }

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: `Invalid option. Use on/off\nCurrent: ${current}`
            });
        }

        settings.set("global", "autorecording", option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"
               ? `✅ Auto Recording: *ON*`
                : `❌ Auto Recording: *OFF*`
        });
    }
};
