const config = require("../../config");

module.exports = {

    name: "time",

    description: "Show current date and time",

    category: "general",

    permission: "any",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const now = new Date();

        const time = now.toLocaleTimeString("en-GB", {
            timeZone: config.TIMEZONE,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        const date = now.toLocaleDateString("en-GB", {
            timeZone: config.TIMEZONE,
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        await sock.sendMessage(jid, {
            text:
`🕒 Current Time

📅 ${date}

⏰ ${time}

🌍 Time Zone: ${config.TIMEZONE}`
        });

    }

};
