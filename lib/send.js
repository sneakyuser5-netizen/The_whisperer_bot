const settings = require("./settings");

async function send(sock, jid, content) {

    const config = settings.get("global");

    try {

        if (config.autotyping) {

            console.log("⌨️ Typing...");

            await sock.sendPresenceUpdate(
                "composing",
                jid
            );

            await new Promise(resolve =>
                setTimeout(resolve, 5000)
            );

            await sock.sendPresenceUpdate(
                "available",
                jid
            );

        }

        else if (config.autorecording) {

            console.log("🎙️ Recording...");

            await sock.sendPresenceUpdate(
                "recording",
                jid
            );

            await new Promise(resolve =>
                setTimeout(resolve, 5000)
            );

            await sock.sendPresenceUpdate(
                "available",
                jid
            );

        }

    } catch (err) {

        console.log("PRESENCE ERROR:", err);

    }

    return await sock.sendMessage(
        jid,
        content
    );

}

module.exports = send;
