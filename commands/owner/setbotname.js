const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {

    name: "setbotname",
    description: "Change the bot name",
    category: "owner",
    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const name = args.join(" ").trim();

        if (!name) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.setbotname_usage")
            });
        }

        try {
            await sock.updateProfileName(name);
        } catch (err) {
            console.log("Couldn't update WhatsApp profile name:", err);
        }

        settings.set("global", "bot_name", name);

        await sock.sendMessage(jid, {
            text: t(jid, "owner.setbotname_success")
                .replace("{name}", name)
        });

    }

};
