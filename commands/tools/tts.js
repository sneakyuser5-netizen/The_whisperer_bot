const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const { EdgeTTS } = require("node-edge-tts");
const { t } = require("../../lib/lang");

const execFileAsync = promisify(execFile);

function getMessageText(message) {
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
function detectLanguage(text) {
    const frenchWords = [
        "le", "la", "les", "un", "une", "des",
        "de", "du", "au", "aux", "et", "ou",
        "mais", "donc", "que", "qui", "quoi",
        "avec", "pour", "dans", "sur", "pas",
        "est", "sont", "être", "avoir",
        "bonjour", "merci", "comment",
        "pourquoi", "parce", "vous", "nous",
        "je", "tu", "il", "elle", "mon", "ma",
        "mes", "ton", "ta", "tes"
    ];

    const words = text
        .toLowerCase()
        .replace(/[^\p{L}\s']/gu, " ")
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
        return "en";
    }

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

    name: "tts",

    description: "Convert text to speech",

    category: "tools",

    permission: "public",

    usage: ".tts",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        const quoted = context?.quotedMessage;

        let text = getMessageText(quoted);

        if (!text) {
            text = args.join(" ").trim();
        }

        if (!text) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.tts_usage")
            });
        }

        if (text.length > 5000) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.tts_too_long")
            });
        }

        const id = Date.now();

        const mp3File = path.join(
            os.tmpdir(),
            `whisperbot-tts-${id}.mp3`
        );

        const opusFile = path.join(
            os.tmpdir(),
            `whisperbot-tts-${id}.ogg`
        );

        try {

            // Generate speech
const language = detectLanguage(text);

const voice =
    language === "fr"
        ? "fr-FR-DeniseNeural"
        : "en-US-AriaNeural";

const lang =
    language === "fr"
        ? "fr-FR"
        : "en-US";

console.log(
    `TTS language: ${language} | voice: ${voice}`
);

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

            // Convert MP3 → OGG/Opus
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

            // Send as WhatsApp voice note
            await sock.sendMessage(jid, {
                audio: fs.readFileSync(opusFile),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            });

        } catch (err) {

            console.error(
                "TTS error:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "tools.tts_failed")
            });

        } finally {

            // Cleanup generated files
            for (const file of [mp3File, opusFile]) {

                try {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                    }
                } catch (cleanupError) {
                    console.error(
                        "TTS cleanup error:",
                        cleanupError
                    );
                }

            }
        }
    }
};
