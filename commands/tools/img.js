const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

const HORDE_URL = "https://aihorde.net/api/v2";
const ANONYMOUS_KEY = "0000000000";

const NEGATIVE_PROMPT = [
    "cartoon",
    "anime",
    "illustration",
    "painting",
    "digital art",
    "3d render",
    "cgi",
    "plastic skin",
    "artificial lighting",
    "oversaturated",
    "unrealistic colors",
    "fantasy lighting",
    "airbrushed",
    "waxy skin",
    "smooth skin",
    "blurry",
    "low resolution",
    "low detail",
    "distorted",
    "deformed",
    "bad anatomy",
    "watermark",
    "text",
    "logo"
].join(", ");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPhotographicModel() {
    try {
        const response = await fetch(
            `${HORDE_URL}/status/models?type=image`
        );

        if (!response.ok) {
            return null;
        }

        const models = await response.json();

        if (!Array.isArray(models) || !models.length) {
            return null;
        }

        const preferred = [
            "albedobase xl",
            "juggernaut",
            "realistic",
            "photoreal",
            "photo",
            "flux.1-schnell",
            "flux"
        ];

        const candidates = models
            .filter(model => model?.name)
            .map(model => ({
                ...model,
                nameLower: String(model.name).toLowerCase()
            }))
            .filter(model =>
                preferred.some(keyword =>
                    model.nameLower.includes(keyword)
                )
            );

        if (!candidates.length) {
            return null;
        }

        candidates.sort((a, b) => {
            const aScore = preferred.reduce(
                (score, keyword, index) =>
                    score + (a.nameLower.includes(keyword)
                        ? (preferred.length - index) * 100
                        : 0),
                0
            );

            const bScore = preferred.reduce(
                (score, keyword, index) =>
                    score + (b.nameLower.includes(keyword)
                        ? (preferred.length - index) * 100
                        : 0),
                0
            );

            if (bScore !== aScore) {
                return bScore - aScore;
            }

            return Number(b.count || 0) - Number(a.count || 0);
        });

        return candidates[0].name;
    } catch (error) {
        console.log("AI HORDE MODEL LOOKUP ERROR:", error.message);
        return null;
    }
}

async function generateImage(prompt) {
    const model = await getPhotographicModel();

    const enhancedPrompt = [
        prompt,
        "photorealistic",
        "real photograph",
        "natural lighting",
        "true-to-life colors",
        "realistic textures",
        "authentic details",
        "professional photography",
        "shot on a real camera",
        "natural depth of field"
    ].join(", ");

    const payload = {
        prompt: enhancedPrompt,
        params: {
            width: 1024,
            height: 1024,
            steps: 30,
            cfg_scale: 7.5,
            sampler_name: "k_euler_a",
            karras: true,
            n: 1,
            negative_prompt: NEGATIVE_PROMPT
        }
    };

    if (model) {
        payload.models = [model];
        console.log("AI HORDE PHOTO MODEL:", model);
    } else {
        console.log("AI HORDE PHOTO MODEL: automatic fallback");
    }

    const response = await fetch(
        `${HORDE_URL}/generate/async`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": ANONYMOUS_KEY
            },
            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `AI Horde submit failed: ${response.status} ${errorText}`
        );
    }

    const job = await response.json();

    if (!job.id) {
        throw new Error("AI Horde did not return a job ID.");
    }

    console.log("AI HORDE JOB:", job.id);

    let delay = 10000;

    for (let attempt = 0; attempt < 90; attempt++) {
        await sleep(delay);

        const statusResponse = await fetch(
            `${HORDE_URL}/generate/status/${job.id}`,
            {
                headers: {
                    "apikey": ANONYMOUS_KEY
                }
            }
        );

        if (statusResponse.status === 429) {
            const retryAfter = Number(
                statusResponse.headers.get("retry-after")
            );

            const waitSeconds =
                Number.isFinite(retryAfter) && retryAfter > 0
                    ? retryAfter
                    : Math.min(delay / 1000 * 1.5, 60);

            console.log(
                `AI HORDE RATE LIMITED. Retrying in ${waitSeconds}s...`
            );

            delay = Math.min(waitSeconds * 1000, 60000);
            continue;
        }

        if (!statusResponse.ok) {
            const errorText = await statusResponse.text().catch(() => "");

            throw new Error(
                `AI Horde status failed: ${statusResponse.status} ${errorText}`
            );
        }

        const status = await statusResponse.json();

        console.log(
            `AI HORDE STATUS: waiting=${status.waiting || 0} ` +
            `processing=${status.processing || 0} ` +
            `done=${status.done}`
        );

        if (status.faulted) {
            throw new Error("AI Horde generation failed.");
        }

        if (status.done && status.generations?.length) {
            const image = status.generations[0]?.img;

            if (!image) {
                throw new Error("AI Horde returned no image.");
            }

            console.log(
                "AI HORDE MODEL USED:",
                status.generations[0]?.model || "unknown"
            );

            return image;
        }

        delay = 10000;
    }

    throw new Error("Image generation timed out.");
}

module.exports = {
    name: "img",
    aliases: ["image"],
    description: "Generate a natural photorealistic image",
    category: "tools",
    permission: "sudo",
    usage: ".img <prompt>",

    execute: async (sock, msg, args = []) => {
        const jid = msg?.key?.remoteJid;

        if (!jid) return;

        if (
            jid.endsWith("@g.us") &&
            settings.get(jid).lock_image === true
        ) {
            return sock.sendMessage(jid, {
                text: t(jid, "message_type_locked")
                    .replace("{type}", t(jid, "message_type_image"))
            });
        }

        const prompt = args.join(" ").trim();

        if (!prompt) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.img_usage")
            });
        }

        try {
            await sock.sendMessage(jid, {
                text: t(jid, "tools.img_generating")
            });

            const imageUrl = await generateImage(prompt);

            await sock.sendMessage(jid, {
                image: { url: imageUrl },
                caption: t(jid, "tools.img_result")
                    .replace("{prompt}", prompt)
            });

        } catch (error) {
            console.error("IMAGE GENERATION ERROR:", error);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.img_error")
            });
        }
    }
};
