const { t } = require("../../lib/lang");

module.exports = {

    name: "setprofilename",
    description: "Change the WhatsApp profile name",
    category: "owner",
    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const name = args.join(" ").trim();

        if (!name) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.setprofilename_usage")
            });
        }

        try {

            await sock.updateProfileName(name);

            await sock.sendMessage(jid, {
                text: t(jid, "owner.setprofilename_success")
                    .replace("{name}", name)
            });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(jid, {
                text: t(jid, "owner.setprofilename_failed")
            });

        }

    }

};
