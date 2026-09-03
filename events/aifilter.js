const OpenAI = require("openai");
const settings = require("../lib/settings");
const { keys } = require("../lib/api");

const client = keys.groq
    ? new OpenAI({
        apiKey: keys.groq,
        baseURL: "https://api.groq.com/openai/v1"
    })
    : null;

const MODEL = "openai/gpt-oss-120b";

function getText(msg) {
    const message = msg?.message;

    if (!message) return "";

    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        message.buttonsResponseMessage?.selectedDisplayText ||
        message.listResponseMessage?.title ||
        ""
    ).trim();
}

function fallbackCategory(text) {
    const value = text.toLowerCase();

    if (/\b(sc[a@]m|fraud|free money|send money|investment opportunity)\b/i.test(value)) {
        return "scam";
    }

    if (/\b(kill you|i will kill|murder you|hurt you)\b/i.test(value)) {
        return "threat";
    }

    if (/\b(idiot|stupid|useless|shut up|fuck you|bitch)\b/i.test(value)) {
        return "harassment";
    }

    return "safe";
}

async function classify(text) {
    if (!client) {
        return fallbackCategory(text);
    }

    try {
        const response = await client.chat.completions.create({
            model: MODEL,
            temperature: 0,
            max_tokens: 8,
            messages: [
                {
                    role: "system",
                    content: `
Classify the message into exactly ONE category:

safe
toxic
harassment
scam
sexual
threat

Return ONLY the category name.

Do not flag normal jokes, disagreements, profanity used casually,
or ordinary conversations unless they clearly match a harmful category.
`
                },
                {
                    role: "user",
                    content: text.slice(0, 1500)
                }
            ]
        });

        const category = response.choices?.[0]?.message?.content
            ?.trim()
            .toLowerCase();

        const allowed = [
            "safe",
            "toxic",
            "harassment",
            "scam",
            "sexual",
            "threat"
        ];

        return allowed.includes(category)
            ? category
            : fallbackCategory(text);

    } catch (err) {

        return fallbackCategory(text);
    }
}

module.exports = {
    name: "aifilter",
    trigger: "messages.upsert",

    execute: async (sock, msg) => {
        const jid = msg?.key?.remoteJid;

        if (!jid || msg?.key?.fromMe) return;
        if (jid === "status@broadcast") return;
        if (!jid.endsWith("@g.us")) return;

        const text = getText(msg);

        if (!text) return;

        // Ignore bot commands.
        if (text.startsWith(".")) return;

        const config = settings.get(jid);

        if (!config.aifilter) return;

        const category = await classify(text);


        if (category === "safe") return;

        try {
            await sock.sendMessage(jid, {
                delete: msg.key
            });

        } catch (err) {
        }
    }
};
