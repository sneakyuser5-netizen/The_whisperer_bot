const { t } = require("../../lib/lang");

module.exports = {

    name: "setbio",
    description: "Change the WhatsApp bio",
    category: "owner",
    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const bio = args.join(" ").trim();

        if (!bio) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.setbio_usage")
            });
        }

        try {

            await sock.updateProfileStatus(bio);

            await sock.sendMessage(jid, {
                text: t(jid, "owner.setbio_success")
                    .replace("{bio}", bio)
            });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(jid, {
                text: t(jid, "owner.setbio_failed")
            });

        }

    }

};
