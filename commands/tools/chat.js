const { t } = require("../../lib/lang");
const OpenAI = require("openai");
const api = require("../../lib/api");

const client = new OpenAI({
    apiKey: api.keys.groq,
    baseURL: api.urls.groq
});
module.exports = {

    name: "chat",
    description: "Chat with WhisperBot",
    category: "tools",
    permission: "public",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const prompt = args.join(" ");

        if (!prompt) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.chat_usage")
            });
        }

        try {

            const completion =
                await client.chat.completions.create({

                    model: "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",
                            content:
`You are WhisperBot, a friendly WhatsApp assistant.
Keep replies concise, helpful and conversational.`
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    temperature: 0.7,
                    max_tokens: 512

                });

            const reply =
                completion.choices[0].message.content;

            await sock.sendMessage(jid, {
                text: reply
            });

} catch (err) {
    console.error(err);

    const message = (err.message || "").toLowerCase();

    if (
        message.includes("rate limit") ||
        message.includes("too many requests") ||
        message.includes("quota") ||
        err.status === 429
    ) {
        return await sock.sendMessage(jid, {
            text: t(jid, "tools.chat_rate_limit")
        });
    }

    return await sock.sendMessage(jid, {
        text: t(jid, "tools.chat_failed")
    });
}

    }

};
