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

const REACTIONS = {
    greeting: ["👋", "😊", "🤗", "🙌", "✨"],
    morning: ["🌄", "🌅", "☀️", "🌞", "🌻"],
    night: ["🌙", "🌃", "✨", "😴", "💤"],
    love: ["❤️", "🥰", "😍", "💕", "💖", "🫶", "💘"],
    happiness: ["😊", "😄", "😁", "🥳", "✨", "🌟"],
    sadness: ["😢", "😭", "🥺", "😔", "💔", "🫂"],
    laughter: ["😂", "🤣", "😭", "💀", "😹"],
    anger: ["😡", "🤬", "😤", "💢", "👿"],
    surprise: ["😮", "😲", "😳", "🤯", "😱"],
    confusion: ["🤔", "🧐", "🤨", "❓", "👀"],
    suspicion: ["🤨", "🧐", "🤥", "🙄", "🫢"],
    success: ["🏆", "🎯", "💯", "🚀", "🔥", "👏"],
    celebration: ["🎉", "🥳", "🎊", "🏆", "🙌", "💃"],
    education: ["🧠", "📚", "🎓", "✏️", "💡"],
    motivation: ["🔥", "💪", "🚀", "💯", "🏆"],
    appreciation: ["❤️", "🙏", "🫶", "👏", "🥰"],
    agreement: ["✅", "💯", "👍", "🙌", "👏"],
    disagreement: ["❌", "👎", "🙅", "🤨"],
    question: ["🤔", "🧐", "👀", "❓"],
    warning: ["⚠️", "🚨", "👀", "😬"],
    sadness: ["😢", "😭", "🥺", "😔", "💔", "🫂"],
    neutral: ["👀", "😊", "😌", "✨", "😎", "🤔"]
};

function getText(msg) {
    const message = msg.message;
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

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function fallbackCategory(text) {
    const t = text.toLowerCase();

    if (/\b(good morning|morning|gm)\b/.test(t)) return "morning";
    if (/\b(good night|goodnight|night|gn)\b/.test(t)) return "night";
    if (/\b(hello|hi|hey|hola|bonjour)\b/.test(t)) return "greeting";

    if (/\b(love|lovely|l'amour|je t'aime|i love you)\b/.test(t)) {
        return "love";
    }

    if (/\b(lol|lmao|lmfao|haha|hahaha|funny)\b/.test(t)) {
        return "laughter";
    }

    if (/\b(sad|sadness|cry|crying|terrible|heartbroken)\b/.test(t)) {
        return "sadness";
    }

    if (/\b(angry|anger|mad|furious|annoyed)\b/.test(t)) {
        return "anger";
    }

    if (/\b(success|successful|succeed|won|win|passed|got the job)\b/.test(t)) {
        return "success";
    }

    if (/\b(congratulations|congrats|celebrate|celebration)\b/.test(t)) {
        return "celebration";
    }

    if (/\b(education|school|study|studying|exam|learn|learning)\b/.test(t)) {
        return "education";
    }

    if (/\b(fake|lies|lie|lying|suspicious)\b/.test(t)) {
        return "suspicion";
    }

    if (/\b(great|excellent|amazing|awesome|fantastic)\b/.test(t)) {
        return "happiness";
    }

    if (/\?(\s*)$/.test(t)) return "question";

    return "neutral";
}

async function classifyMessage(text) {
    if (!client) return fallbackCategory(text);

    try {
        const response = await client.chat.completions.create({
            model: MODEL,
            temperature: 0,
            max_tokens: 8,
            messages: [
                {
                    role: "system",
                    content: `
Classify the WhatsApp message into EXACTLY ONE category.

Allowed categories:
greeting
morning
night
love
happiness
sadness
laughter
anger
surprise
confusion
suspicion
success
celebration
education
motivation
appreciation
agreement
disagreement
question
warning
neutral

Return ONLY the category name.
No emoji.
No explanation.
No punctuation.

Choose based on the actual meaning of the message.
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

        if (category && REACTIONS[category]) {
            return category;
        }

        return fallbackCategory(text);

    } catch (err) {
        console.error("Autoreact AI error:", err.message);
        return fallbackCategory(text);
    }
}

module.exports = {
    name: "autoreact",
    trigger: "messages.upsert",

    execute: async (sock, msg) => {
        const jid = msg.key?.remoteJid;
        const messageId = msg.key?.id;

        if (!jid || !messageId) return;
        if (msg.key?.fromMe) return;
        if (jid === "status@broadcast") return;

        const text = getText(msg);
        if (!text) return;

        // Ignore bot commands.
        if (text.startsWith(".")) return;

        const config = settings.get(jid);
        if (!config.autoreact) return;

        const category = await classifyMessage(text);
        const emoji = random(REACTIONS[category] || REACTIONS.neutral);

        try {
            await sock.sendMessage(jid, {
                react: {
                    text: emoji,
                    key: msg.key
                }
            });
        } catch (err) {
            console.error("Autoreact error:", err.message);
        }
    }
};
