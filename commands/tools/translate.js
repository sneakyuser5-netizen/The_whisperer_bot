const { t } = require("../../lib/lang");
const { translate } = require("@vitalets/google-translate-api");
const languages = {
    en: "English",
    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ar: "Arabic",
    ru: "Russian",
    hi: "Hindi",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean"
};
module.exports = {

    name: "translate",

    description: "Translate text to another language",

    category: "tools",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;
let target = "en";

if (
    args.length &&
    /^[a-z]{2}$/i.test(args[0])
) {
    target = args.shift().toLowerCase();
}

let text = args.join(" ");

        // Reply translation
        if (!text && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

            const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

            text =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                "";

        }

        if (!text) {

            return sock.sendMessage(jid, {
                text: t(jid, "tools.translate_usage")
            });

        }

        try {

const result = await translate(text, {
    to: target
});
console.log(result);
const from = languages[result.raw.src] || result.raw.src;
const to = languages[target] || target;

await sock.sendMessage(jid, {
    text:
`🌍 *Translation*

🌐 From: ${from}
🎯 To: ${to}

📝 Original:
${text}

✅ Translation:
${result.text}`
});

        } catch (err) {

     console.error(err);
            await sock.sendMessage(jid, {
                text: t(jid, "tools.translate_failed")
            });

        }

    }

}; 

