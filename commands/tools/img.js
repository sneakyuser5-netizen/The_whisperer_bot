const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {
    name: "img",
    aliases: ["image"],
    description: "Generate an image from a text prompt",
    category: "tools",
    permission: "public",
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

        await sock.sendMessage(jid, {
            text: t(jid, "tools.img_generating")
        });

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
                caption: `🖼️ ${prompt}`
            });

        } catch (err) {
            console.error("Image generation error:", err.message);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.img_failed")
            });
        }
    }
};
