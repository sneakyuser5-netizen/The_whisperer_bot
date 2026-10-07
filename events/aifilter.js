const OpenAI = require("openai");
const settings = require("../lib/settings");
const { keys } = require("../lib/api");
const { t } = require("../lib/lang");

const client = keys.groq
    ? new OpenAI({
        apiKey: keys.groq,
        baseURL: "https://api.groq.com/openai/v1"
    })
    : null;

const MODEL = "openai/gpt-oss-120b";

const warns = {};

function getText(msg) {

    const m = msg?.message;

    if (!m) return "";

    return (
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        ""
    ).trim();
}

/*
 * Local fallback.
 *
 * IMPORTANT:
 * Use word boundaries so words such as "con..." or
 * other harmless words are not detected just because
 * they contain a bad substring.
 */
function fallbackCategory(value) {

    const v = value
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    // Threats
    if (
        /\b(kill you|i will kill you|i'll kill you|murder you|hurt you|i will hurt you|i'll hurt you|i go kill you|i go beat you)\b/i.test(v)
    ) {
        return "threat";
    }

    // Sexual
    if (
        /\b(nudes?|porn|xxx|pussy|dick pic|sex chat|send nudes|send me nudes)\b/i.test(v)
    ) {
        return "sexual";
    }

    // Scam
    if (
        /\b(send money|free money|crypto double|double your money|send me money)\b/i.test(v)
    ) {
        return "scam";
    }

    // Strong harassment / insults.
    //
    // Word boundaries are intentional.
    if (
        /\b(fuck|fucking|shit|bitch|asshole|bastard|idiot|stupid|mugu|mumu|ode|olosho|imbecile|pute|salope|nique|yab|rubbish|useless|big fool)\b/i.test(v)
    ) {
        return "harassment";
    }

    // Multi-word harassment.
    if (
        /\b(shut up|get out|go away|you are stupid|you're stupid|you are useless|you're useless|you big fool)\b/i.test(v)
    ) {
        return "harassment";
    }

    return "safe";
}

async function classify(text) {

    if (!client) {
        return fallbackCategory(text);
    }

    try {

        const r = await client.chat.completions.create({

            model: MODEL,

            temperature: 0,

            max_tokens: 10,

            messages: [

                {
                    role: "system",

                    content: `
You are a fair WhatsApp group moderation classifier.

Classify the user's message into exactly ONE word:

safe
toxic
harassment
threat
scam
sexual

IMPORTANT RULES:

1. Be conservative.
2. Normal conversation is SAFE.
3. Friendly teasing is SAFE unless it is clearly abusive.
4. Slang alone is SAFE.
5. A word should NOT be flagged merely because it contains another word as a substring.
6. Mild frustration is SAFE.
7. Do not classify a message as harassment just because it contains profanity.
8. Harassment requires a clear insult, abuse, humiliation, or targeted degrading language.
9. Threat requires an actual threat of physical harm.
10. Sexual requires clearly sexual or explicit content.
11. Scam requires a clear attempt to deceive someone for money, credentials, or financial gain.
12. Toxic is for clearly hostile or abusive content that does not fit the other categories.
13. If uncertain, ALWAYS choose safe.

Return ONLY the category word.
                    `.trim()
                },

                {
                    role: "user",
                    content: text.slice(0, 1000)
                }

            ]
        });

        const cat =
            r.choices?.[0]?.message?.content
                ?.trim()
                .toLowerCase()
                .split(/\s+/)[0];

        const allowed = [
            "safe",
            "toxic",
            "harassment",
            "scam",
            "sexual",
            "threat"
        ];

        if (!allowed.includes(cat)) {
            return fallbackCategory(text);
        }

        return cat;

    } catch (err) {

        console.log(
            "[AIFILTER] AI classification failed:",
            err.message
        );

        return fallbackCategory(text);
    }
}

module.exports = {

    name: "aifilter",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        const jid = msg?.key?.remoteJid;

        if (
            !jid ||
            msg?.key?.fromMe ||
            !jid.endsWith("@g.us")
        ) {
            return;
        }

        const text = getText(msg);

        if (!text || text.startsWith(".")) {
            return;
        }

        if (!settings.get(jid).aifilter) {
            return;
        }

        const category = await classify(text);

        if (category === "safe") {
            return;
        }

        /*
         * Keep LID exactly as WhatsApp supplied it.
         */
        const rawJid =
            msg.key.participant ||
            msg.participant ||
            msg.key.participantAlt;

        if (!rawJid) {
            return;
        }

        const senderJid = rawJid;

        const tag =
            `@${senderJid.split("@")[0]}`;

        if (!warns[jid]) {
            warns[jid] = {};
        }

        if (!warns[jid][senderJid]) {
            warns[jid][senderJid] = 0;
        }

        warns[jid][senderJid] += 1;

        const count =
            warns[jid][senderJid];

        const reasonText =
            t(
                jid,
                `tools.aifilter_reason_${category}`
            );

        try {

            await sock.sendMessage(jid, {
                delete: msg.key
            });

            if (count < 3) {

                await sock.sendMessage(jid, {

                    text:
                        `${reasonText}\n\n` +
                        `${tag} ${t(jid, "tools.aifilter_deleted")}\n` +
                        `*${t(jid, "tools.aifilter_reason_label")}:* ${category}\n` +
                        `*${t(jid, "tools.aifilter_warning")}:* ${count}/3\n\n` +
                        `_${t(jid, "tools.aifilter_keep_respectful")}_`,

                    mentions: [senderJid]
                });

            } else {

                await sock.sendMessage(jid, {

                    text:
                        `❌ ${tag} ${t(jid, "tools.aifilter_kicked")}\n` +
                        `${t(jid, "tools.aifilter_reason_label")}: ${reasonText}\n` +
                        `${t(jid, "tools.aifilter_last_msg")}: "${text.slice(0, 80)}"`,

                    mentions: [senderJid]
                });

                try {

                    const res =
                        await sock.groupParticipantsUpdate(
                            jid,
                            [senderJid],
                            "remove"
                        );

                    console.log(
                        `[AIFILTER] KICK RES:`,
                        JSON.stringify(res),
                        `JID: ${senderJid}`
                    );

                } catch (kickErr) {

                    console.log(
                        `[AIFILTER] KICK FAILED ${senderJid}:`,
                        kickErr.message
                    );

                    await sock.sendMessage(jid, {

                        text:
                            `${tag} ${t(jid, "tools.aifilter_not_admin")}`,

                        mentions: [senderJid]
                    });
                }

                warns[jid][senderJid] = 0;
            }

        } catch (e) {

            console.log(
                "[AIFILTER] fail",
                e.message
            );
        }
    }
};
