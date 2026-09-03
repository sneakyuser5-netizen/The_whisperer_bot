const settings = require("../lib/settings");
const ai = require("../lib/ai");

module.exports = {

    name: "ai",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        try {

            if (!msg?.message) return;

            // Never respond to our own messages.
            if (msg.key?.fromMe) return;

            const jid = msg.key?.remoteJid;

            if (!jid) return;

            // Ignore WhatsApp status.
            if (jid === "status@broadcast") return;

            // AI must be explicitly enabled for this chat.
            if (!settings.get(jid).ai) return;

            const message = msg.message;

            const text =
                message.conversation ||
                message.extendedTextMessage?.text ||
                message.imageMessage?.caption ||
                message.videoMessage?.caption ||
                message.documentMessage?.caption ||
                "";

            if (!text.trim()) return;

            const input = text.trim();

            /*
             * Commands belong to the normal command handler.
             * Do not let automatic AI answer .ping, .menu, .ai on, etc.
             */
            const prefix = ".";

            if (input.startsWith(prefix)) {
                return;
            }

            const reply =
                await ai.generateReply(
                    jid,
                    input,
                    msg
                );

            if (!reply) return;

            await sock.sendMessage(jid, {
                text: reply
            });

        } catch (err) {

            console.error(
                "Automatic AI error:",
                err.message
            );

        }
    }
};
