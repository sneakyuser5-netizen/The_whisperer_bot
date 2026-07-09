const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");

const { loadCommands, handleMessage } = require("./handler");
const { loadEvents, runEvents } = require("./eventHandler");


const PHONE_NUMBER = "237641037454";

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
                console.log("✅ CONNECTED SUCCESSFULLY");
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
