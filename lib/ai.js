const OpenAI = require("openai");
const api = require("./api");
const memory = require("./memory");

const conversations = new Map();

const MAX_HISTORY = 12;
const MAX_PROMPT_LENGTH = 12000;
const MAX_REPLY_LENGTH = 12000;

const SYSTEM_PROMPT = `
You are WhisperBot, a powerful and friendly WhatsApp AI assistant.

Rules:
- Give accurate, useful and direct answers.
- Understand natural conversation and previous context.
- Be concise for simple questions and detailed when appropriate.
- Help with programming, debugging, mathematics, writing, translation, explanations and general knowledge.
- Support English and French naturally.
- If the user speaks French, answer in French.
- If the user speaks English, answer in English.
- Use clear formatting suitable for WhatsApp.
- Never claim to have performed an action you did not perform.
- Do not invent facts when uncertain.
- Treat remembered information as context, not absolute truth.
`.trim();

function getConversation(jid) {
    if (!conversations.has(jid)) {
        conversations.set(jid, []);
    }

    return conversations.get(jid);
}

function trimConversation(history) {
    if (history.length > MAX_HISTORY) {
        history.splice(0, history.length - MAX_HISTORY);
    }
}

function getQuotedText(msg) {
    const context =
        msg.message?.extendedTextMessage?.contextInfo;

    const quoted = context?.quotedMessage;

    if (!quoted) return null;

    return (
        quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        quoted.videoMessage?.caption ||
        quoted.documentMessage?.caption ||
        null
    );
}

function cleanReply(text) {
    if (!text) return "";

    return String(text)
        .trim()
        .slice(0, MAX_REPLY_LENGTH);
}

async function extractMemories(client, jid, userMessage, assistantReply) {
    try {
        const existing = memory.get(jid);

        const extraction =
            await client.chat.completions.create({
                model: "openai/gpt-oss-120b",

                messages: [
                    {
                        role: "system",
                        content: `
You are WhisperBot's long-term memory extraction system.

Identify only information that is genuinely useful for remembering this user
in future conversations.

Good memories:
- Name or preferred name
- Long-term preferences
- Important projects
- Stable goals
- Important recurring context
- Explicit instructions about how the assistant should interact

Do NOT remember:
- Temporary questions
- Random facts
- Passwords
- API keys
- Tokens
- Private credentials
- One-time events
- Sensitive personal information unless absolutely necessary

Return ONLY a JSON array of short strings.

If nothing is worth remembering, return [].

Existing memories:
${JSON.stringify(existing.slice(-30))}
`
                    },
                    {
                        role: "user",
                        content:
                            `User message:\n${userMessage}\n\n` +
                            `Assistant response:\n${assistantReply}`
                    }
                ],

                temperature: 0,
                max_tokens: 500
            });

        const content =
            extraction.choices?.[0]?.message?.content?.trim();

        if (!content) return;

        let memories;

        try {
            memories = JSON.parse(content);
        } catch {
            const match = content.match(/\[[\s\S]*\]/);

            if (!match) return;

            memories = JSON.parse(match[0]);
        }

        if (!Array.isArray(memories)) return;

        for (const item of memories.slice(0, 3)) {
            if (
                typeof item === "string" &&
                item.trim()
            ) {
                memory.add(jid, item);
            }
        }

    } catch (err) {
        console.error(
            "Memory extraction error:",
            err.message
        );
    }
}

async function generateReply(jid, input, msg = null) {
    if (!api.keys.groq) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    if (!input || !String(input).trim()) {
        return null;
    }

    input = String(input).trim();

    if (input.length > MAX_PROMPT_LENGTH) {
        throw new Error("PROMPT_TOO_LONG");
    }

    const client = new OpenAI({
        apiKey: api.keys.groq,
        baseURL: api.urls.groq
    });

    const history = getConversation(jid);

    const relevantMemories =
        memory.search(jid, input, 10);

    const memoryContext =
        relevantMemories.length
            ? `
Long-term memories relevant to this conversation:
${relevantMemories
    .map(item => `- ${item.text}`)
    .join("\n")}
`
            : "";

    const quotedText =
        msg ? getQuotedText(msg) : null;

    let userContent = input;

    if (quotedText) {
        userContent =
            `The user is replying to this WhatsApp message:\n` +
            `---\n${quotedText.slice(0, 6000)}\n---\n\n` +
            `User's new message:\n${input}`;
    }

    history.push({
        role: "user",
        content: userContent
    });

    trimConversation(history);

    try {
        const completion =
            await client.chat.completions.create({
                model: "openai/gpt-oss-120b",

                messages: [
                    {
                        role: "system",
                        content:
                            SYSTEM_PROMPT +
                            "\n\n" +
                            memoryContext
                    },
                    ...history
                ],

                temperature: 0.7,
                max_tokens: 2048
            });

        const reply = cleanReply(
            completion.choices?.[0]?.message?.content
        );

        if (!reply) {
            history.pop();
            return null;
        }

        history.push({
            role: "assistant",
            content: reply
        });

        trimConversation(history);

        // Long-term memory extraction happens after the response.
        extractMemories(
            client,
            jid,
            input,
            reply
        ).catch(err => {
            console.error(
                "Background memory error:",
                err.message
            );
        });

        return reply;

    } catch (err) {
        history.pop();
        throw err;
    }
}

function resetConversation(jid) {
    conversations.delete(jid);
}

function getStatus(jid) {
    return {
        history: conversations.get(jid)?.length || 0,
        memories: memory.get(jid).length
    };
}

module.exports = {
    generateReply,
    resetConversation,
    getStatus
};
