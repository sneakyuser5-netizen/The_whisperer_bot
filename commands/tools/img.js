require("dotenv").config();

const { InferenceClient } = require("@huggingface/inference");
const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

const hf = new InferenceClient(process.env.HF_TOKEN);

module.exports = {
    name: "img",
    aliases: ["image"],
    description: "Generate a realistic image from a text prompt",
    category: "tools",
    permission: "sudo",
    usage: ".img <prompt>",

    execute: async (sock, msg, args = []) => {
        const jid = msg?.key?.remoteJid;

        if (!jid) return;

        // Respect group image lock
        if (jid.endsWith("@g.us") && settings.get(jid).lock_image === true) {
            return sock.sendMessage(jid, {
                text: `${t(jid, "admin.lock_locked_emoji")} image ${t(jid, "admin.lock_locked_text")}`
            });
        }

        const prompt = args.join(" ").trim();

        if (!prompt) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.img_usage")
            });
        }

        if (prompt.length > 1000) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.img_too_long")
            });
        }

        if (!process.env.HF_TOKEN) {
            return sock.sendMessage(jid, {
                text: "❌ Image generation is not configured."
            });
        }

        await sock.sendMessage(jid, {
            text: t(jid, "tools.img_generating")
        });

        try {
            /*
             * Convert the user's short prompt into a detailed
             * photorealistic photography prompt.
             */
            const realisticPrompt = `
Create a highly photorealistic, natural-looking professional photograph of:

${prompt}

PHOTOGRAPHY REQUIREMENTS:
- Realistic human anatomy and believable body proportions
- Natural facial features
- Accurate hands, fingers, arms and feet
- Realistic skin texture, pores and subtle imperfections
- Natural hair with realistic individual strands
- Realistic clothing and fabric folds
- Physically accurate lighting and shadows
- Natural depth of field
- Realistic materials and reflections
- Authentic environmental details
- True-to-life colors
- Natural exposure
- Professional full-frame camera photography
- 50mm lens
- Realistic perspective
- Natural composition
- Candid and believable appearance
- Subtle imperfections that make the scene feel real

VISUAL STYLE:
Photorealistic professional photography,
documentary photography, natural lighting,
real-world textures, realistic color grading,
cinematic but believable, lifelike,
high detail, physically plausible.

AVOID:
cartoon, anime, illustration, painting, drawing,
digital art, CGI, 3D render, plastic skin,
wax figure appearance, doll-like face,
overly smooth skin, distorted anatomy,
extra fingers, missing fingers, deformed hands,
duplicated limbs, unnatural eyes, distorted face,
unnatural body proportions, excessive HDR,
oversaturated colors, artificial lighting,
fake-looking background, text, letters,
watermark, logo, signature.

The final image must look like a real photograph
taken with a real professional camera.
`.trim();

            /*
             * FLUX Schnell is being used because the test confirmed
             * that this model works through your Hugging Face account.
             */
            const image = await hf.textToImage({
                model: "black-forest-labs/FLUX.1-schnell",
                inputs: realisticPrompt
            });

            if (!image) {
                throw new Error("Hugging Face returned no image");
            }

            const buffer = Buffer.from(
                await image.arrayBuffer()
            );

            if (!buffer.length) {
                throw new Error("Generated image is empty");
            }

            /*
             * Send the generated image directly to WhatsApp.
             */
            await sock.sendMessage(jid, {
                image: buffer,
                mimetype: "image/png",
                caption: `🖼️ ${prompt}`
            });

        } catch (err) {
            /*
             * Keep API errors out of the WhatsApp response.
             * The command simply reports the normal failure message.
             */
            await sock.sendMessage(jid, {
                text: t(jid, "tools.img_failed")
            });
        }
    }
};
