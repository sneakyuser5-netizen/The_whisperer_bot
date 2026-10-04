const axios = require("axios");
const { t } = require("../../lib/lang");
const api = require("../../lib/api");

module.exports = {
    name: "dic",
    description: "Look up word definitions",
    category: "tools",
    permission: "sudo",
    usage: ".dic <word>",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.dictionary_usage")
            });
        }

        const word = args.join(" ").toLowerCase();

        try {

            const { data } = await axios.get(
                `${api.urls.dictionary}/${encodeURIComponent(word)}`
            );

            const entry = data[0];

            const meaning = entry.meanings[0];

            const definition = meaning.definitions[0];

            const synonyms =
                definition.synonyms?.length
                    ? definition.synonyms.slice(0, 5).join(", ")
                    : t(jid, "tools.dictionary_none");

            const example =
                definition.example ||
                t(jid, "tools.dictionary_none");

            await sock.sendMessage(
                jid,
                {
                    text:
`📖 *${entry.word}*

🏷️ Part of speech:
${meaning.partOfSpeech}

📚 Definition:
${definition.definition}

💬 Example:
${example}

🔗 Synonyms:
${synonyms}`
                },
                {
                    quoted: msg
                }
            );

        } catch (err) {
        console.error("Dictionary error:", err.response?.status || err.message);

        if (err.response?.status === 404) {
            return await sock.sendMessage(jid, {
                text: t(jid, "tools.dictionary_not_found")
            });
        }

        await sock.sendMessage(jid, {
            text: t(jid, "tools.dictionary_failed")
        });
    }

    }

};
