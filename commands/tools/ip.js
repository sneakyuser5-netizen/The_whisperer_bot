const { t } = require("../../lib/lang");
const https = require("https");

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = "";

            res.on("data", chunk => data += chunk);

            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on("error", reject);
    });
}

module.exports = {
    name: "ip",
    description: "Lookup IP address information",
    category: "tools",
    permission: "public",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const ip = args[0] || "";

        try {

                const url = ip
    ? `https://ipwho.is/${ip}`
    : `https://ipwho.is/`;
            const data = await fetch(url);
            console.log(data);

if (!data.success) {
    console.log(data);
    return sock.sendMessage(jid, {
        text: t(jid, "tools.ip_invalid")
    });
}
            const text =
`${t(jid, "tools.ip_result")}

🌐 IP: ${data.ip}
🏳️ Country: ${data.country}
🏙️ City: ${data.city}
📍 Region: ${data.region}
🛰️ ISP: ${data.connection.isp}
🕒 Timezone: ${data.timezone.id}
📮 Postal: ${data.postal}
📌 Coordinates: ${data.latitude}, ${data.longitude}`;
            await sock.sendMessage(jid, { text });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(jid, {
                text: t(jid, "tools.ip_failed")
            });

        }

    }
};
