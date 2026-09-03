const axios = require("axios");
const { t } = require("../../lib/lang");
const api = require("../../lib/api");
module.exports = {
    name: "news",
    description: "Show latest headlines",
    category: "info",
    permission: "public",
    usage: ".news [country]",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;
        const apiKey = api.keys.news;

        if (!apiKey) {
            return sock.sendMessage(jid, {
                text: t(jid, "info.news_no_api")
            });
        }

        const country = (args[0] || "us").toLowerCase();

        try {

            const { data } = await axios.get(
            api.urls.news,
                {
                    params: {
                        apikey: apiKey,
                        country,
                        language: "en"
                    }
                }
            );

            if (!data.results || !data.results.length) {
                return sock.sendMessage(jid, {
                    text: t(jid, "info.news_empty")
                });
            }

            const headlines = data.results
                .slice(0, 5)
                .map((item, i) =>
`${i + 1}. *${item.title}*
🔗 ${item.link}`)
                .join("\n\n");

            await sock.sendMessage(
                jid,
                {
                    text:
`📰 *${t(jid, "info.news_title")}*

${headlines}`
                },
                {
                    quoted: msg
                }
            );

        } catch {

            await sock.sendMessage(jid, {
                text: t(jid, "info.news_error")
            });

        }

    }
};
