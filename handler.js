const fs = require("fs");
const config = require("./config");
const settings = require("./lib/settings");
const sudo = require("./lib/sudo");
const ownerDB = require("./lib/owner");
const commands = new Map();
const cooldowns = new Map();
async function isAdmin(sock, msg) {

    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return false;
    }

    const metadata = await sock.groupMetadata(jid);

    const sender = msg.key.participant;

    const participant = metadata.participants.find(
        p => p.id === sender
    );

    console.log("CHECKING ADMIN:", participant);

    return (
        participant?.admin === "admin" ||
        participant?.admin === "superadmin"
    );
}   

function loadCommands(dir = "./commands") {

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const path = `${dir}/${file}`;

        if (fs.statSync(path).isDirectory()) {

            loadCommands(path);

            continue;
        }


        if (!file.endsWith(".js")) continue;


        const command = require(path);


        commands.set(command.name, command);


        if (command.aliases) {

            for (const alias of command.aliases) {

                commands.set(alias, command);

            }

        }


        console.log("✅ Command loaded:", command.name);
    }

}
    
async function handleMessage(sock, msg) {

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text;

    if (!text) return;
    const args = text.trim().split(/\s+/).slice(1);

    const sender = msg.key.remoteJid;

const senderId =
    msg.key.participant ||
    msg.key.remoteJid;

const creator =
    config.OWNER;

const botOwner =
    ownerDB.get();

const isCreator =
    senderId.includes(creator);

const isBotOwner =
    senderId.includes(botOwner);

const isOwner =
    isCreator ||
    isBotOwner ||
    msg.key.fromMe;
    console.log({
    creator,
    botOwner,
    senderId,
    isCreator,
    isBotOwner
});

const isSudo =
    sudo.has(senderId);

const mode =
    settings.get("global").mode || "private";

const cmd = text
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(".", "");

const command = commands.get(cmd);
 
if (!command) return;
if (command.cooldown) {

    const now = Date.now();

    const user = sender;

    const key = `${command.name}:${user}`;

    const lastUsed = cooldowns.get(key);

    const cooldownTime = command.cooldown * 1000;

 if (lastUsed && now - lastUsed < cooldownTime) {

        const remaining = Math.ceil(
            (cooldownTime - (now - lastUsed)) / 1000
        );

        await sock.sendMessage(
            sender,
            {
                text: `⏳ Please wait ${remaining}s before using this command again.`
            }
        );

        return;
    }

    cooldowns.set(key, now);
}    
    const permission = command.permission || "public";
    const jid = msg.key.remoteJid;
    

if (
    mode === "private" &&
    !isOwner &&
    !isSudo
) {

    await sock.sendMessage(
        sender,
        {
            text:
`🔒 WhisperBot is in *PRIVATE MODE*.

😂 The boss hid the keys.

Ask the owner nicely... or bring pizza 🍕.`
        }
    );

    return;
            }

if (
    command.permission === "admin" &&
    !jid.endsWith("@g.us")
) {
    return sock.sendMessage(jid, {
        text: "❌ This command only works in groups."
    });
}

// then check admin status
const permissions = require("./lib/permissions");

if (permission === "admin") {

    const admin = await isAdmin(sock, msg);

    if (!admin) {

        await sock.sendMessage(
            sender,
            {
                text: "❌ This command is only for group admins."
            }
        );

        return;
    }
}


if (command.usage && command.minArgs) {

    if (args.length < command.minArgs) {

        await sock.sendMessage(
            sender,
            {
                text:
`❌ Missing argument.

Usage:
${command.usage}`
            }
        );

        return;
    }
}

console.log("COMMAND:", command.name);
console.log("ARGS:", args);

await command.execute(sock, msg, args);

}
function getCommands() {
    return [...new Set(commands.values())];
}

module.exports = {
    loadCommands,
    handleMessage,
    commands,
};
