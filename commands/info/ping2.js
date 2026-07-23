const { t } = require("../../lib/lang");

module.exports = {

    name: "ping2",

    description: "Advanced ping",

    category: "info",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const start = Date.now();

        await sock.sendMessage(jid, {
            text: t("info.ping_testing")
        });

        const speed = Date.now() - start;

        const memory =
            Math.round(
                process.memoryUsage().rss / 1024 / 1024
            );

        await sock.sendMessage(jid, {
            text:
`${t("info.ping_title")}

⚡ ${t("info.ping_speed")}
${speed}ms

🧠 ${t("info.ping_memory")}
${memory}MB

🟢 ${t("info.ping_status")}
${t("info.ping_online")}

😂 ${t("info.ping_footer")}`
        });

    }

};
