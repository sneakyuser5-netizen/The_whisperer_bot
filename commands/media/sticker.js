const { t } = require("../../lib/lang");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

module.exports = {
    name: "sticker",
    description: "Download stickers from a Telegram sticker pack",
    category: "media",
    permission: "public",
    usage: ".sticker <Telegram sticker pack link>",
    minArgs: 1,

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;
        const link = args.join(" ").trim();

        // ==========================================
        // CHECK LINK
        // ==========================================

        if (!link) {
            return sock.sendMessage(jid, {
                text: t(jid, "sticker_missing")
            });
        }

        const match = link.match(
            /^https?:\/\/t\.me\/addstickers\/([A-Za-z0-9_-]+)\/?$/
        );

        if (!match) {
            return sock.sendMessage(jid, {
                text: t(jid, "sticker_invalid")
            });
        }

        const mediaDir = path.join(
            __dirname,
            "../../media"
        );

        if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, {
                recursive: true
            });
        }

        const baseName = `telegram-sticker-${Date.now()}`;
        const packDir = path.join(mediaDir, baseName);

        fs.mkdirSync(packDir, {
            recursive: true
        });

        try {
            // ==========================================
            // START MESSAGE
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "sticker_downloading")
            });

            // ==========================================
            // DOWNLOAD TELEGRAM STICKERS WITH TELETHON
            // ==========================================

            await new Promise((resolve, reject) => {
                execFile(
                    fs.existsSync(path.join(path.resolve(__dirname, "../.."), ".venv", "bin", "python"))
                        ? path.join(path.resolve(__dirname, "../.."), ".venv", "bin", "python")
                        : "python3",
                    [
                        path.join(
                            path.resolve(__dirname, "../.."),
                            "lib",
                            "telegram_stickers.py"
                        ),
                        link,
                        packDir
                    ],
                    {
                        maxBuffer: 20 * 1024 * 1024
                    },
                    (error, stdout, stderr) => {
                        if (stdout) {
                            console.log(
                                "TELEGRAM STICKER:",
                                stdout
                            );
                        }

                        if (stderr) {
                            console.error(
                                "TELEGRAM STICKER STDERR:",
                                stderr
                            );
                        }

                        if (error) {
                            console.error(
                                "TELEGRAM STICKER ERROR:",
                                error.message
                            );

                            reject(error);
                            return;
                        }

                        resolve();
                    }
                );
            });

            // ==========================================
            // CONVERT TGS STICKERS TO ANIMATED WEBP
            // ==========================================

            if (!fs.existsSync(packDir)) {
                throw new Error(
                    "Sticker download directory was not created."
                );
            }

            const rootDir = path.resolve(
                __dirname,
                "../.."
            );

            const converter = path.join(
                rootDir,
                ".lottie-converter",
                "bin",
                "lottie_to_webp.sh"
            );

            if (!fs.existsSync(converter)) {
                throw new Error(
                    "Lottie converter is not installed."
                );
            }

            const tgsFiles = fs
                .readdirSync(packDir)
                .filter(file =>
                    /^sticker_\d+\.tgs$/i.test(file)
                )
                .sort((a, b) => {
                    const numberA = parseInt(
                        a.match(/\d+/)[0],
                        10
                    );

                    const numberB = parseInt(
                        b.match(/\d+/)[0],
                        10
                    );

                    return numberA - numberB;
                });

            console.log(
                `🎨 Telegram TGS stickers downloaded: ${tgsFiles.length}`
            );

            if (!tgsFiles.length) {
                throw new Error(
                    "No TGS stickers were downloaded."
                );
            }

            for (const file of tgsFiles) {
                const inputFile = path.join(
                    packDir,
                    file
                );

                const outputFile = path.join(
                    packDir,
                    file.replace(/\.tgs$/i, ".webp")
                );

                console.log(
                    `🎨 Converting ${file} → ${path.basename(outputFile)}`
                );

                await new Promise((resolve, reject) => {
                    execFile(
                        converter,
                        [
                            "--output",
                            outputFile,
                            inputFile
                        ],
                        {
                            maxBuffer: 20 * 1024 * 1024
                        },
                        (error, stdout, stderr) => {
                            if (stdout) {
                                console.log(
                                    "LOTTIE CONVERTER:",
                                    stdout
                                );
                            }

                            if (stderr) {
                                console.error(
                                    "LOTTIE CONVERTER STDERR:",
                                    stderr
                                );
                            }

                            if (error) {
                                console.error(
                                    `LOTTIE CONVERTER ERROR ${file}:`,
                                    error.message
                                );

                                reject(error);
                                return;
                            }

                            resolve();
                        }
                    );
                });
            }

            // ==========================================
            // FIND CONVERTED WEBP FILES
            // ==========================================

            const stickerFiles = fs
                .readdirSync(packDir)
                .filter(file =>
                    /^sticker_\d+\.webp$/i.test(file)
                )
                .sort((a, b) => {
                    const numberA = parseInt(
                        a.match(/\d+/)[0],
                        10
                    );

                    const numberB = parseInt(
                        b.match(/\d+/)[0],
                        10
                    );

                    return numberA - numberB;
                });

            console.log(
                `🎨 Telegram stickers ready for WhatsApp: ${stickerFiles.length}`
            );

            if (!stickerFiles.length) {
                throw new Error(
                    "No converted WEBP stickers were produced."
                );
            }

            // ==========================================
            // SEND STICKERS TO WHATSAPP
            // ==========================================

            let sent = 0;

            for (const file of stickerFiles) {
                const stickerFile = path.join(
                    packDir,
                    file
                );

                if (!fs.existsSync(stickerFile)) {
                    continue;
                }

                try {
                    await sock.sendMessage(jid, {
                        sticker: {
                            url: stickerFile
                        }
                    });

                    sent++;

                    // Prevent flooding WhatsApp
                    await new Promise(resolve =>
                        setTimeout(resolve, 500)
                    );

                } catch (err) {
                    console.error(
                        `WHATSAPP STICKER ${file} ERROR:`,
                        err.message
                    );
                }
            }

            // ==========================================
            // CHECK RESULT
            // ==========================================

            if (sent === 0) {
                throw new Error(
                    "No stickers could be sent."
                );
            }

            // ==========================================
            // SUCCESS
            // ==========================================

            await sock.sendMessage(jid, {
                text: t(jid, "sticker_success")
                    .replace(
                        "{{count}}",
                        String(sent)
                    )
            });

        } catch (err) {
            console.error(
                "TELEGRAM STICKER COMMAND ERROR:",
                err
            );

            await sock.sendMessage(jid, {
                text: t(jid, "sticker_failed")
            });

        } finally {
            // ==========================================
            // CLEANUP
            // ==========================================

            try {
                if (fs.existsSync(packDir)) {
                    fs.rmSync(packDir, {
                        recursive: true,
                        force: true
                    });

                    console.log(
                        "🧹 Telegram sticker files cleaned."
                    );
                }
            } catch (err) {
                console.error(
                    "STICKER CLEANUP ERROR:",
                    err.message
                );
            }
        }
    }
};
