const os = require("os");
const { t } = require("../../lib/lang");

module.exports = {

    name: "system",

    description: "Server information",

    category: "info",

    permission: "public",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {

            text:
`${t("info.system_title")}

🖥️ ${t("info.system_platform")} ${os.platform()}

🏗️ ${t("info.system_architecture")} ${os.arch()}

⚙️ ${t("info.system_cpu")} ${os.cpus().length} ${t("info.system_cores")}

📦 ${t("info.system_node")} ${process.version}

😂 ${t("info.system_footer")}`

        });

    }

};
