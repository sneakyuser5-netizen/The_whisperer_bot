const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const { EdgeTTS } = require("node-edge-tts");
const { t } = require("../../lib/lang");

const execFileAsync = promisify(execFile);

function unwrapMessage(message) {
    let current = message;

    while (current) {
        if (current.ephemeralMessage?.message) {
            current = current.ephemeralMessage.message;
            continue;
        }

        if (current.viewOnceMessage?.message) {
            current = current.viewOnceMessage.message;
            continue;
        }

        if (current.viewOnceMessageV2?.message) {
            current = current.viewOnceMessageV2.message;
            continue;
        }

        if (current.viewOnceMessageV2Extension?.message) {
            current = current.viewOnceMessageV2Extension.message;
            continue;
        }

        if (current.documentWithCaptionMessage?.message) {
            current = current.documentWithCaptionMessage.message;
            continue;
        }

        break;
    }

    return current || {};
}

function extractText(message) {
    const m = unwrapMessage(message);

    return (
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        m.documentMessage?.caption ||
        m.buttonsResponseMessage?.selectedDisplayText ||
        m.listResponseMessage?.title ||
        ""
    ).trim();
}

function detectLanguage(text) {
    const frenchWords = [
        "bonjour",
        "salut",
        "merci",
        "comment",
        "pourquoi",
        "avec",
        "dans",
        "une",
        "des",
        "les",
        "est",
        "suis",
        "vous",
        "nous",
        "je",
        "tu",
        "bonne",
        "soir",
        "nuit",
        "jour"
    ];

    const words = text.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿœ]+/g) || [];

    const frenchScore = words.filter(word =>
        frenchWords.includes(word)
    ).length;

    return frenchScore >= 1 ? "fr" : "en";
}

function getVoice(language) {
    return language === "fr"
        ? "fr-FR-DeniseNeural"
        : "en-US-GuyNeural";
}

module.exports = {
    name: "robot",
    description: "Read a replied text using a robotic voice",
    category: "tools",
    permission: "public",
    usage: ".robot",

    execute: async (sock, msg) => {
        const jid = msg?.key?.remoteJid;

        if (!jid) return;

        const message = unwrapMessage(msg.message);
        const context =
            message.extendedTextMessage?.contextInfo;

        const quotedMessage = context?.quotedMessage;

        if (!quotedMessage) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.robot_reply")
            });
        }

        const text = extractText(quotedMessage);

        if (!text) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.robot_text_only")
            });
        }

        if (text.length > 3000) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.robot_too_long")
            });
        }

        await sock.sendMessage(jid, {
            text: t(jid, "tools.robot_generating")
        });

        const tempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "whisperbot-robot-")
        );

        const mp3File = path.join(tempDir, "voice.mp3");
        const robotFile = path.join(tempDir, "robot.ogg");

        try {
            const language = detectLanguage(text);
            const voice = getVoice(language);

            const tts = new EdgeTTS({
                voice,
                lang: language === "fr" ? "fr-FR" : "en-US",
                outputFormat:
                    "audio-24khz-96kbitrate-mono-mp3",
                timeout: 15000
            });

            await tts.ttsPromise(text, mp3File);

            /*
             * Robotic/metallic voice processing:
             * - compression
             * - metallic chorus/flanger
             * - slight bit crushing
             * - presence boost
             */
            await execFileAsync("ffmpeg", [
                "-y",
                "-i",
                mp3File,

                "-af",
                [
                    "asetrate=16000",
                    "aresample=24000",
                    "atempo=1.5",
                    "highpass=f=70",
                    "lowpass=f=4800",
                    "equalizer=f=180:t=q:w=1:g=5",
                    "equalizer=f=700:t=q:w=1:g=-3",
                    "acompressor=threshold=-22dB:ratio=8:attack=3:release=60",
                    "acrusher=bits=8:mix=0.35",
                    "flanger=delay=12:depth=8:regen=0.75:width=90:speed=0.25",
                    "aecho=0.8:0.7:35:0.25"
                ].join(","),

                "-c:a",
                "libopus",
                "-b:a",
                "32k",
                "-vbr",
                "on",
                "-application",
                "voip",

                robotFile
            ]);

            await sock.sendMessage(jid, {
                audio: fs.readFileSync(robotFile),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            });

        } catch (err) {
            console.error("Robot TTS error:", err.message);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.robot_failed")
            });

        } finally {
            try {
                fs.rmSync(tempDir, {
                    recursive: true,
                    force: true
                });
            } catch {}
        }
    }
};
