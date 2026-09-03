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

const recentReplies = new Map();
const COOLDOWN = 5 * 60 * 1000;

function unwrapMessage(message) {
    if (!message) return null;

    return (
        message.ephemeralMessage?.message ||
        message.viewOnceMessage?.message ||
        message.viewOnceMessageV2?.message ||
        message.viewOnceMessageV2Extension?.message ||
        message.documentWithCaptionMessage?.message ||
        message
    );
}

function getText(msg) {
    const message = unwrapMessage(msg?.message);

    if (!message) return "";

    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        message.buttonsResponseMessage?.selectedDisplayText ||
        message.listResponseMessage?.title ||
        message.templateButtonReplyMessage?.selectedDisplayText ||
        ""
    ).trim();
}

function obviousGoodnight(text) {
    return /\b(good\s*night|goodnight|good\s*nite|bonne\s+nuit)\b/i.test(text);
}

function shortGoodnight(text) {
    return /\b(gn|bn)\b/i.test(text.trim());
}

async function isGoodnight(text) {
    if (obviousGoodnight(text) || shortGoodnight(text)) {
        return true;
    }

    if (!client) return false;

    try {
        const response = await client.chat.completions.create({
            model: MODEL,
            temperature: 0,
            max_tokens: 5,
            messages: [
                {
                    role: "system",
                    content: `
Determine whether this message means the person is going to sleep,
saying good night, or saying goodbye before sleeping.

Understand English and French.

Return ONLY:
YES
or
NO

YES examples:
I am going to sleep
I'm off to bed
Time for me to sleep
I should get some sleep
I'm heading to bed
Je vais dormir
Je vais me coucher
Je pars dormir
Il est temps de dormir

NO examples:
Good morning
How was your night?
I slept well
`
                },
                {
                    role: "user",
                    content: text.slice(0, 1000)
                }
            ]
        });

        return response.choices?.[0]?.message?.content
            ?.trim()
            .toUpperCase() === "YES";

    } catch (err) {

        return false;
    }
}

async function generateReply(text) {
    if (!client) {
        return "Good night. 🌙";
    }

    try {
        const response = await client.chat.completions.create({
            model: MODEL,
            temperature: 0.7,
            max_tokens: 40,
            messages: [
                {
                    role: "system",
                    content: `
You are WhisperBot.

Reply to a good-night message with ONE short, friendly response.

Use the same language as the user's message.
English -> English.
French -> French.

Maximum 12 words.
Do not mention AI.
Do not explain anything.
`
                },
                {
                    role: "user",
                    content: text.slice(0, 1000)
                }
            ]
        });

        return (
            response.choices?.[0]?.message?.content?.trim() ||
            "Good night. 🌙"
        );

    } catch (err) {

        return "Good night. 🌙";
    }
}

module.exports = {
    name: "autogoodnight",
    trigger: "messages.upsert",

    execute: async (sock, msg) => {
        const jid = msg?.key?.remoteJid;


        if (!jid) {
            return;
        }

        if (msg?.key?.fromMe) {
            return;
        }

        if (jid === "status@broadcast") {
            return;
        }

        const text = getText(msg);

        if (!text) {
            return;
        }


        if (text.startsWith(".")) {
            return;
        }

        const config = settings.get(jid);

        if (!config.autogoodnight) {
            return;
        }

        /*
         * Obvious good-night messages bypass the cooldown.
         * This makes "Good night Palavas" respond immediately.
         */
        const obvious = obviousGoodnight(text) || shortGoodnight(text);

        if (!obvious) {
            const now = Date.now();
            const lastReply = recentReplies.get(jid) || 0;

            if (now - lastReply < COOLDOWN) {
                return;
            }
        }

        const detected = await isGoodnight(text);


        if (!detected) return;

        const now = Date.now();
        recentReplies.set(jid, now);

        const reply = await generateReply(text);

        try {
            await sock.sendMessage(jid, {
                text: reply
            });


        } catch (err) {
        }
    }
};
