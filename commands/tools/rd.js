const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const { EdgeTTS } = require("node-edge-tts");
const { t } = require("../../lib/lang");

const execFileAsync = promisify(execFile);

function getQuotedImage(msg) {
    return (
        msg.message?.extendedTextMessage
            ?.contextInfo?.quotedMessage?.imageMessage
    );
}

function detectLanguage(text) {
    const frenchWords = [
        "le", "la", "les", "des", "du",
        "un", "une", "est", "sont",
        "avec", "pour", "dans", "sur",
        "que", "qui", "pas", "mais",
        "bonjour", "merci", "vous",
        "nous", "être", "avoir",
        "français", "française"
    ];

    const words = text
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean);

    let frenchScore = 0;

    for (const word of words) {
        if (frenchWords.includes(word)) {
            frenchScore++;
        }
    }

    // French accents are a strong signal.
    if (/[àâäçéèêëîïôöùûüÿœ]/i.test(text)) {
        frenchScore += 2;
    }

    return frenchScore >= 2 ? "fr" : "en";
}

module.exports = {

    name: "rd",

    description: "Read text from an image aloud",

    category: "tools",

    permission: "public",

    usage: ".rd",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const imageMessage = getQuotedImage(msg);

        if (!imageMessage) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.rd_usage")
            });
        }

        const id = Date.now();

        const imageFile = path.join(
            os.tmpdir(),
            `whisperbot-ocr-${id}.jpg`
        );

        const mp3File = path.join(
            os.tmpdir(),
            `whisperbot-rd-${id}.mp3`
        );

        const opusFile = path.join(
            os.tmpdir(),
            `whisperbot-rd-${id}.ogg`
        );

        try {

            // Download the quoted image.
            const image = await downloadMediaMessage(
                {
                    message: {
                        imageMessage
                    }
                },
                "buffer",
                {},
                {
                    logger: sock.logger,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            fs.writeFileSync(imageFile, image);

            // OCR: English + French.
            const { stdout } = await execFileAsync(
                "tesseract",
                [
                    imageFile,
                    "stdout",
                    "-l",
                    "eng+fra",
                    "--psm",
                    "6"
                ],
                {
                    maxBuffer: 1024 * 1024 * 5
                }
            );

            const text = stdout
                .replace(/\r/g, "")
                .replace(/[ \t]+/g, " ")
                .replace(/\n{3,}/g, "\n\n")
                .trim();

            if (!text) {
                return sock.sendMessage(jid, {
                    text: t(jid, "tools.rd_no_text")
                });
            }

            if (text.length > 5000) {
                return sock.sendMessage(jid, {
                    text: t(jid, "tools.rd_too_long")
                });
            }

            const language = detectLanguage(text);

            const voice =
                language === "fr"
                    ? "fr-FR-DeniseNeural"
                    : "en-US-AriaNeural";

            const lang =
                language === "fr"
                    ? "fr-FR"
                    : "en-US";

            // Generate speech.
            const tts = new EdgeTTS({
                voice,
                lang,
                outputFormat:
                    "audio-24khz-96kbitrate-mono-mp3",
                timeout: 15000
            });

            await tts.ttsPromise(
                text,
                mp3File
            );

            // Convert MP3 → WhatsApp-compatible Opus.
            await execFileAsync(
                "ffmpeg",
                [
                    "-y",
                    "-i",
                    mp3File,
                    "-c:a",
                    "libopus",
                    "-b:a",
                    "32k",
                    "-vbr",
                    "on",
                    "-application",
                    "voip",
                    opusFile
                ]
            );

            await sock.sendMessage(jid, {
                audio: fs.readFileSync(opusFile),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            });

        } catch (err) {

            console.error(
                "RD OCR/TTS error:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "tools.rd_failed")
            });

        } finally {

            for (const file of [
                imageFile,
                mp3File,
                opusFile
            ]) {

                try {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                    }
                } catch (cleanupError) {
                    console.error(
                        "RD cleanup error:",
                        cleanupError
                    );
                }
            }
        }
    }
};
