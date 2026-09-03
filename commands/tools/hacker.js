const { t } = require("../../lib/lang");

const STYLES = [
    "cinematic cyberpunk movie poster, wide dramatic composition, powerful perspective",
    "futuristic digital artwork, highly detailed environment, dynamic composition",
    "dark techno-noir artwork, dramatic shadows, atmospheric lighting, artistic composition",
    "elite hacker concept art, futuristic technology, intricate details, cinematic depth",
    "glitch-art cyberpunk poster, digital distortion, neon reflections, bold composition",
    "mysterious futuristic artwork, surreal technology, dramatic lighting, deep atmosphere",
    "high-end game concept art, epic scale, detailed futuristic world, cinematic framing",
    "luxury cyberpunk poster, sleek futuristic design, sophisticated lighting, premium artwork"
];

const LIGHTING = [
    "cyan and blue neon lighting",
    "purple and magenta neon lighting",
    "red and black dramatic lighting",
    "green digital terminal lighting",
    "gold and dark cinematic lighting",
    "cold white futuristic lighting",
    "multi-colored holographic lighting"
];

const COMPOSITIONS = [
    "close-up hero composition",
    "full-body cinematic composition",
    "wide environmental shot",
    "low-angle powerful composition",
    "centered poster composition",
    "dramatic side-angle composition",
    "over-the-shoulder cinematic composition"
];

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
    name: "hacker",
    description: "Generate a hacker-style image from text",
    category: "tools",
    permission: "public",
    usage: ".hacker <text>",

    execute: async (sock, msg, args = []) => {
        const jid = msg?.key?.remoteJid;

        if (!jid) return;

        const text = args.join(" ").trim();

        if (!text) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.hacker_usage")
            });
        }

        if (text.length > 1000) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.hacker_too_long")
            });
        }

        await sock.sendMessage(jid, {
            text: t(jid, "tools.hacker_generating")
        });

        const style = random(STYLES);
        const lighting = random(LIGHTING);
        const composition = random(COMPOSITIONS);

        const prompt = `
Create a unique professional digital artwork based primarily on the following subject:

"${text}"

IMPORTANT:
The subject above is the MAIN focus of the image.
Interpret the meaning of the subject creatively.
Do NOT replace the subject with a generic anonymous hacker.
Do NOT automatically create the same hooded hacker character.
Do NOT reuse the same composition as previous images.

If the subject is a person, character, name, object, creature, place, concept, title, or idea,
make that exact subject visually dominant.

If the subject suggests a character, design a distinctive character around it.
If the subject suggests an object, make that object the centerpiece.
If the subject is a name or title, create visual symbolism that represents that name.
If the subject is abstract, turn its meaning into a striking visual scene.

Hacker/cyberpunk influence should only be used as an aesthetic layer,
not as the main subject unless the requested subject itself is a hacker.

Visual direction:
${style}
${lighting}
${composition}

Add futuristic technology, subtle digital interfaces, atmospheric effects,
depth, realistic materials, dramatic shadows and highly detailed artwork.

Make every generation visually different.
Avoid generic repeated hooded figures.
Avoid repetitive centered portraits.
Avoid copying a standard hacker poster.

Professional concept art.
High detail.
Strong visual storytelling.
4K quality.
`;

        try {
            const encodedPrompt = encodeURIComponent(prompt);

            const url =
                `https://image.pollinations.ai/prompt/${encodedPrompt}` +
                `?model=flux` +
                `&width=1024` +
                `&height=1024` +
                `&nologo=true` +
                `&private=true` +
                `&enhance=true`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Image API returned ${response.status}`);
            }

            const buffer = Buffer.from(
                await response.arrayBuffer()
            );

            if (!buffer.length) {
                throw new Error("Empty image response");
            }

            await sock.sendMessage(jid, {
                image: buffer,
                mimetype: "image/jpeg",
                caption: `🕶️ ${text}`
            });

        } catch (err) {
            console.error("Hacker image error:", err.message);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.hacker_failed")
            });
        }
    }
};
