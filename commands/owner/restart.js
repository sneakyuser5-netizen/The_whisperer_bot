const { t } = require("../../lib/lang");
const { exec } = require("child_process");

module.exports = {

    name: "restart",

    description: "Restart WhisperBot",

    category: "owner",

    permission: "sudo",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text: t("owner.restart")
        });

        setTimeout(() => {
    process.exit(1);
}, 2000);

    }

};
