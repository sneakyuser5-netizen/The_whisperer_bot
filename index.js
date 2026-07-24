const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const { loadCommands, handleMessage } = require("./handler");
const { loadEvents, runEvents } = require("./eventHandler");
const settings = require("./lib/settings");


const setup = require("./lib/setup");
const BOT_OWNER = "THE-WHISPERER";
const BOT_VERSION = "1.0.0";

async function startBot() {
    try {
    
    const { state, saveCreds } = await useMultiFileAuthState("./session");

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" })
        });
        global.sock = sock;

const originalSendMessage = sock.sendMessage.bind(sock);

sock.sendMessage = async (jid, content, options) => {

    try {

        const config = settings.get("global");

        if (config.autotyping) {


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

    return originalSendMessage(
        jid,
        content,
        options
    );

};

        sock.ev.on("creds.update", saveCreds);

        // load commands ONCE
        loadCommands();
        loadEvents();

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                
                const owner =
    sock.user.id.split(":")[0];

const ownerDB =
    require("./lib/owner");

const data = ownerDB.get();

if (!data || data.botOwner !== owner) {

    ownerDB.set(owner);
    setup.clearPhone();

}
                const info = ownerDB.get();

if (!info.welcomed) {

    try {

        await sock.sendMessage(
            owner + "@s.whatsapp.net",
            {
                image: fs.readFileSync("./assets/welcome.png"),

                caption:
`━━━━━━━━━━━━━━━
🤖 *WhisperBot*

Welcome *${sock.user.name || "Owner"}*! 🎉

Your WhatsApp has been linked successfully.

👑 You are now the owner of this WhisperBot instance.

🚀 Start by typing:

*.menu*

Useful commands:

• .private
• .public
• .setsudo
• .ping

Enjoy your new assistant!

━━━━━━━━━━━━━━━

Made with ❤️ by
*THE-WHISPERER-237*`
            }
        );

        ownerDB.welcomed();

        

    } catch (err) {

        

    }

}


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
            const messageCache = require("./lib/messageCache");

// Save every incoming message
if (msg.message && !msg.key.fromMe) {
    messageCache.save(msg);
}
            const identity = require("./lib/identity");
            const afk = require("./lib/afk");
            const botId = sock.user.id.split(":")[0];

const senderId = identity.getSender(msg);

if (senderId === botId) {
    return;
}
  
    if (!msg.message) return;
            


const sender = identity.getSender(msg);

const activity = require("./lib/activity");

// Only record activity from real users in groups
if (
    !msg.key.fromMe &&
    msg.key.remoteJid.endsWith("@g.us")
) {
    activity.update(
        msg.key.remoteJid,
        sender
    );
}

if (afk.has(sender)) {

    const data = afk.get(sender);

    const duration = afk.format(
        Date.now() - data.time
    );

    afk.remove(sender);

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:
`🎉 Welcome back!

⏰ You were away for:
${duration}

📝 Reason:
${data.reason}

😂 Hope you didn't forget about me 😎`
        }
    );

}

    const read = require("./lib/read");

    if (read.get("global")) {

    await sock.readMessages([
        msg.key
    ]);

    }
            const context =
    msg.message?.extendedTextMessage?.contextInfo;

const mentions =
    context?.mentionedJid || [];

if (mentions.length) {

    for (const user of mentions) {

    if (!afk.has(user)) continue;

    const data = afk.get(user);

    const duration = afk.format(
        Date.now() - data.time
    );
    

    await sock.sendMessage(
        msg.key.remoteJid,
        {
            text:

`😴 That user is currently AFK.

📝 Reason:
${data.reason}

⏰ Away for:
${duration}

😂 They're probably hiding from responsibilities.`,
            
        }
    );
    break;
    }
}      
await runEvents(
        "messages.upsert",
        sock,
        msg
    );
await handleMessage(
        sock,
        msg
    );

}); 
    
     sock.ev.on("group-participants.update", async (update) => {

    await runEvents(
        "group-participants.update",
        sock,
        update
    );

});
        sock.ev.on("presence.update", ({ id, presences }) => {

    const presence = require("./lib/presence");

    for (const user in presences) {

        const state = presences[user]?.lastKnownPresence;

        if (
            state === "available" ||
            state === "composing" ||
            state === "recording" ||
            state === "paused"
        ) {
            presence.set(user);
        }

    }

});

        setTimeout(async () => {
            try {

                if (!sock.authState.creds.registered) {
                    const phone = setup.getPhone();

if (
    !phone?.trim() ||
    phone.trim() === "237612345678"
) {

    console.log(`
╔══════════════════════════════════════╗
║          🤖 WHISPERBOT SETUP         ║
╚══════════════════════════════════════╝

Welcome to WhisperBot!

Follow these steps:

1️⃣ Open:
   database/setup.json

2️⃣ Replace:

   {
     "phone": ""
   }

3️⃣ With your WhatsApp number:

   {
     "phone": "237612345678"
   }

4️⃣ Save the file.

5️⃣ Restart the bot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After restarting,
your Pairing Code will appear here.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    return;

}
                    const code = await sock.requestPairingCode(phone);

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
