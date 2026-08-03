const { t } = require("../../lib/lang");
const axios = require("axios");
const api = require("../../lib/api");
module.exports = {
    name: "currency",
    description: "Convert currencies",
    category: "tools",
    permission: "public",
    usage: ".currency <amount> <from> <to>",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (args.length < 3) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.currency_usage")
            });
        }

        const amount = Number(args[0]);

        if (isNaN(amount)) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.currency_invalid_amount")
            });
        }

        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();

        try {

            const { data } = await axios.get(
                `${api.exchange.url}/${from}`
            );

            if (data.result !== "success") {
                throw new Error();
            }

            const rate = data.rates[to];

            if (!rate) {
                return sock.sendMessage(jid, {
                    text: t(jid, "tools.currency_invalid_code")
                });
            }

            const result = (amount * rate).toFixed(2);

            await sock.sendMessage(
                jid,
                {
                    text:
`💱 *${t(jid, "tools.currency_result")}*

${amount} ${from}
⬇
${result} ${to}

Rate: 1 ${from} = ${rate} ${to}`
                },
                {
                    quoted: msg
                }
            );

        } catch {

            await sock.sendMessage(jid, {
                text: t(jid, "tools.currency_error")
            });

        }

    }
};
