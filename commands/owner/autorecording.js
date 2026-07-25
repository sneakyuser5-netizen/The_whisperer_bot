const settings = require("../../lib/settings");
const { t } = require("../../lib/lang");

module.exports = {
    name: "autorecording",
    description: "Enable or disable auto recording",
    category: "owner",
    permission: "owner",
    usage: ".autorecording on/off",

    execute: async (sock, msg) => { // remove args
        const jid = msg.key.remoteJid;
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const args = body.trim().split(/ +/).slice(1);
        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: `*Usage:*.autorecording on\n*Usage:*.autorecording off\n\nCurrent: ${settings.get("global").autorecording? "ON" : "OFF"}`
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
