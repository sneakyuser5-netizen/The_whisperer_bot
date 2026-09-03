const QRCode = require("qrcode");
const { t } = require("../../lib/lang");

module.exports = {
    name: "qr",
    description: "Generate QR codes",
    category: "tools",
    permission: "public",
    usage: ".qr <text>",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(jid, {
                text: t(jid, "tools.qr_usage")
            });
        }

        const text = args.join(" ");

        try {

            const buffer = await QRCode.toBuffer(text);

            await sock.sendMessage(
                jid,
                {
                    image: buffer,
                    caption: `📱 ${t(jid, "tools.qr_success")}`
                },
                {
                    quoted: msg
                }
            );

        } catch {

            await sock.sendMessage(jid, {
                text: t(jid, "tools.qr_error")
            });

        }

    }
};
