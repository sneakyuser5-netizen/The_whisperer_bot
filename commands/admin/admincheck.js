const { t } = require("../../lib/lang");

module.exports = {

    name: "admincheck",

    description: "Test admin permission",

    category: "admin",

    permission: "all",

    execute: async (sock, msg) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: t("admin_check_confirmed")
            }
        );

    }
};
