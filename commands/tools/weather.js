const { t } = require("../../lib/lang");
const axios = require("axios");

module.exports = {
    name: "weather",
    description: "Show current weather",
    category: "tools",
    permission: "sudo",
    usage: ".weather <city>",
    minArgs: 1,

    execute: async (sock, msg, args) => {
        const jid = msg.key.remoteJid;
        const city = args.join(" ");

        try {
            const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            if (!geoRes.data.results || geoRes.data.results.length === 0) throw new Error("City not found");
            const loc = geoRes.data.results[0];
            const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`);
            const c = weatherRes.data.current;
            const codes = { 0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Cloudy", 45: "Foggy", 48: "Fog", 51: "Light Drizzle", 61: "Light Rain", 71: "Light Snow", 80: "Rain Showers", 95: "Thunderstorm" };
            const weatherText = `${t(jid, "tools.weather_title")}\n\n📍 ${loc.name}, ${loc.country}\n🌡️ ${t(jid, "tools.weather_temperature")} ${Math.round(c.temperature_2m)}°C\n🤒 ${t(jid, "tools.weather_feels_like")} ${Math.round(c.apparent_temperature)}°C\n💧 ${t(jid, "tools.weather_humidity")} ${c.relative_humidity_2m}%\n🌬️ ${t(jid, "tools.weather_wind")} ${Math.round(c.wind_speed_10m)} km/h\n☁️ ${t(jid, "tools.weather_condition")} ${codes[c.weather_code] || c.weather_code}`;
            await sock.sendMessage(jid, { text: weatherText });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(jid, { text: t(jid, "tools.weather_failed") });
        }
    }
};
