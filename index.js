const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");

const { loadCommands, handleMessage } = require("./handler");
const { loadEvents, runEvents } = require("./eventHandler");
const settings = require("./lib/settings");


const PHONE_NUMBER = "237641037454";
const BOT_OWNER = "THE-WHISPERER-237";
const BOT_VERSION = "1.0.0";

async function startBot() {
    try {

        const { state, saveCreds } = await useMultiFileAuthState("./session");

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" })
        });

        sock.ev.on("creds.update", saveCreds);

        // load commands ONCE
        loadCommands();
        loadEvents();

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {

    const number =
        sock.user.id.split(":")[0];


    const uptime = () => {

        const seconds =
            Math.floor((Date.now() - START_TIME) / 1000);

        const hours =
            Math.floor(seconds / 3600);

        const minutes =
            Math.floor((seconds % 3600) / 60);

        const secs =
            seconds % 60;

        return `${hours}h ${minutes}m ${secs}s`;

    };


    console.log(`
╔════════════════════════════════╗
║        🤖 BOT ONLINE           ║
╠════════════════════════════════╣
║ 👑 Owner:
║ ${BOT_OWNER}
║
║ 📱 Number:
║ +${number}
║
║ 📦 Version:
║ ${BOT_VERSION}
║
║ ⚡ Status:
║ Connected ✅
║
║ ⏱️ Uptime:
║ ${uptime()}
╚════════════════════════════════╝
    `);

            }

            if (connection === "close") {
                const statusCode = lastDisconnect?.error?.output?.statusCode;

                console.log("❌ Connection closed. Code:", statusCode);

                if (statusCode !== DisconnectReason.loggedOut) {
                    setTimeout(() => startBot(), 3000);
                }
            }
        });
        sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0];

    if (!msg.message) return;
            const read = require("./lib/read");

const user =
msg.key.participant ||
msg.key.remoteJid;

if (read.get(user)) {

    await runEvents(
    "messages.upsert",
    sock,
    msg
);


if (settings.get("global").autotyping) {

    await sock.sendPresenceUpdate(
        "composing",
        msg.key.remoteJid
    );

    await new Promise(resolve =>
        setTimeout(resolve, 5000)
    );

    await sock.sendPresenceUpdate(
        "paused",
        msg.key.remoteJid
    );

}


await handleMessage(sock, msg);

                   }

    await runEvents(
        "messages.upsert",
        sock,
        msg
    );

    await handleMessage(sock, msg);

});
    
        sock.ev.on("group-participants.update", async (update) => {

    await runEvents(
        "welcome",
        sock,
        update
    );

    await runEvents(
        "goodbye",
        sock,
        update
    );

});
        

        sock.ev.on("group-participants.update", async (update) => {

    await runEvents(
        "group-participants.update",
        sock,
        update
    );

});

        setTimeout(async () => {
            try {

                if (!sock.authState.creds.registered) {
                    const code = await sock.requestPairingCode(PHONE_NUMBER);

                    console.log("\n======================");
                    console.log("PAIR CODE 👉", code);
                    console.log("======================\n");
                }

            } catch (err) {
                console.log("Pairing error:", err);
            }
        }, 4000);

    } catch (err) {
        console.log("FATAL ERROR:", err);
        setTimeout(startBot, 5000);
    }
}
const START_TIME = Date.now();

global.START_TIME = START_TIME;


startBot();
