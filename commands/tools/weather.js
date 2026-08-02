const { t } = require("../../lib/lang");
const axios = require("axios");

module.exports = {
    name: "weather",
    description: "Show current weather",
    category: "tools",
    permission: "public",
    usage: ".weather <city>",
    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;
        const city = args.join(" ");

        try {

            const url =
                `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

            const { data } = await axios.get(url);

            const current = data.current_condition[0];

            const weather =
`${t(jid, "tools.weather_title")}

📍 ${city}
🌡️ ${t(jid, "tools.weather_temperature")} ${current.temp_C}°C
🤒 ${t(jid, "tools.weather_feels_like")} ${current.FeelsLikeC}°C
💧 ${t(jid, "tools.weather_humidity")} ${current.humidity}%
🌬️ ${t(jid, "tools.weather_wind")} ${current.windspeedKmph} km/h
☁️ ${t(jid, "tools.weather_condition")} ${current.weatherDesc[0].value}`;

            await sock.sendMessage(jid, {
                text: weather
            });

        } catch (err) {
            console.error(err);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.weather_failed")
            });
        }
    }
};
