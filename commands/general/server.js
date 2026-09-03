const os = require("os");
const { t } = require("../../lib/lang");

module.exports = {

    name: "server",

    description: "Show server information",

    category: "general",

    execute: async (sock, msg) => {

        const text =
`${t("general.server_title")}

${t("general.server_platform")}: ${os.platform()}

${t("general.server_architecture")}: ${os.arch()}

${t("general.server_cpu")}: ${os.cpus().length}

${t("general.server_hostname")}: ${os.hostname()}`;

        await sock.sendMessage(msg.key.remoteJid, {
            text
        });

    }

};
