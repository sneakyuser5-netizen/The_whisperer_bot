const { t } = require("../../lib/lang");

module.exports = {

    name: "shorturl",
    description: "Shorten a URL",
    category: "tools",
    permission: "public",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const url = args[0];

        if (!url) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.shorturl_usage")
            });
        }

        if (!/^https?:\/\/.+/i.test(url)) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.shorturl_invalid")
            });
        }

        try {

            const response = await fetch(
                `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
            );

            const short = await response.text();

            await sock.sendMessage(jid, {
                text: t(jid, "tools.shorturl_result")
                    .replace("{original}", url)
                    .replace("{short}", short)
            });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.shorturl_failed")
            });

        }

    }

};
