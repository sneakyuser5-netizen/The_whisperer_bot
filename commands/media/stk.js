const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { t } = require("../../lib/lang");

const execFileAsync = promisify(execFile);

module.exports = {

    name: "stk",

    description: "Convert an image to a WhatsApp sticker",

    category: "media",

    permission: "public",

    usage: ".stk",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const quoted =
            msg.message?.extendedTextMessage
                ?.contextInfo?.quotedMessage;

        if (!quoted?.imageMessage) {
            return sock.sendMessage(jid, {
                text: t(jid, "media.stk_usage")
            });
        }

        const tempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "whisperbot-stk-")
        );

        const input = path.join(tempDir, "input.jpg");
        const output = path.join(tempDir, "sticker.webp");

        try {

            const image = await downloadMediaMessage(
                {
                    message: quoted
                },
                "buffer",
                {},
                {
                    logger: sock.logger,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            fs.writeFileSync(input, image);

            await execFileAsync("ffmpeg", [
                "-y",
                "-i", input,

                "-vf",
                "scale=512:512:force_original_aspect_ratio=decrease," +
                "pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0",

                "-c:v", "libwebp",
                "-q:v", "70",

                "-an",
                output
            ]);

            if (!fs.existsSync(output)) {
                throw new Error("Sticker output was not created.");
            }

            await sock.sendMessage(jid, {
                sticker: fs.readFileSync(output)
            });

        } catch (err) {

            console.error(
                "Sticker conversion error:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "media.stk_failed")
            });

        } finally {

            try {
                fs.rmSync(tempDir, {
                    recursive: true,
                    force: true
                });
            } catch (cleanupError) {
                console.error(
                    "Sticker cleanup error:",
                    cleanupError
                );
            }
        }
    }
};
