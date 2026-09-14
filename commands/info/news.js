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
            const { data } = await axios.get(api.urls.news, {
                params: {
                    apiKey,
                    country,
                    pageSize: 5
                },
                timeout: 15000
            });

            if (data.status !== "ok") {
                throw new Error(data.message || "NewsAPI request failed");
            }

            if (!Array.isArray(data.articles) || !data.articles.length) {
                return sock.sendMessage(jid, {
                    text: t(jid, "info.news_empty")
                });
            }

            const headlines = data.articles
                .slice(0, 5)
                .map((item, i) =>
                    `${i + 1}. *${item.title || "Untitled"}*\n` +
                    `📰 ${item.source?.name || "Unknown source"}\n` +
                    `🔗 ${item.url || ""}`
                )
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

        } catch (error) {
            console.error("News command error:", error.response?.data || error.message);

            await sock.sendMessage(jid, {
                text: t(jid, "info.news_error")
            });
        }
    }
};
