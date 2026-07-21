const fs = require("fs");
const { t } = require("./lib/lang");
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
// Save messages for purge command
if (msg.key.remoteJid.endsWith("@g.us")) {

    global.messageCache =
        global.messageCache || {};

    global.messageCache[msg.key.remoteJid] =
        global.messageCache[msg.key.remoteJid] || [];


    global.messageCache[msg.key.remoteJid].push(msg);


    // Keep only latest 100 messages
    if (
        global.messageCache[msg.key.remoteJid].length > 100
    ) {

        global.messageCache[msg.key.remoteJid]
        .shift();

    }

}

    if (!text) return;
   

    const sender = msg.key.remoteJid;

   const identity = require("./lib/identity");

identity.debug(msg);

const senderId =
    identity.getSender(msg);

const isOwner =
    identity.isOwner(msg);

const isSudo =
    identity.isSudo(msg);
const mute = require("./lib/mute");

const groupId = msg.key.remoteJid;
if (
    groupId.endsWith("@g.us") &&
    mute.isMuted(groupId, senderId) &&
    !identity.isCreator(msg) &&
    !identity.isBotOwner(msg) &&
    !isSudo
) {
    return;
}

console.log({
    sender: senderId,
    creator: identity.getCreator(),
    botOwner: identity.getBotOwner(),
    isCreator: identity.isCreator(msg),
    isBotOwner: identity.isBotOwner(msg),
    isOwner,
    isSudo
});
const mode =
    settings.get("global").mode || "private";

let body = text.trim();

if (body.startsWith(". ")) {
    body = "." + body.slice(2);
}

// Ignore messages without the prefix
if (!body.startsWith(".")) {
    return;
}

const parts = body.split(/\s+/);

const cmd = parts[0]
    .slice(1) // Remove only the first character (the prefix)
    .toLowerCase();

const args = parts.slice(1);

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

// Private mode
if (
    mode === "private" &&
    !isOwner &&
    !isSudo
) {
    return sock.sendMessage(sender, {
        text: t("private_mode")
    });
}

// Creator only
if (
    permission === "creator" &&
    !identity.isCreator(msg)
) {
    return sock.sendMessage(sender, {
    text: t("creator_only")
    });
}

// Owner only
if (
    permission === "owner" &&
    !isOwner
) {
    return sock.sendMessage(sender, {
        text: t("owner_only")
    });
}

// Sudo
if (
    permission === "sudo" &&
    !isOwner &&
    !isSudo
) {
    return sock.sendMessage(sender, {
        text:
`🚫 Permission denied.

Become a sudo member first... or start negotiating with the owner. 🤝😂`
    });
}

// Admin commands
if (
    permission === "admin"
) {

    if (!jid.endsWith("@g.us")) {

        return sock.sendMessage(jid, {
            text: t("group_only")
        });

    }

    const admin = await isAdmin(sock, msg);

    if (!admin) {

        return sock.sendMessage(jid, {
            text:
`🚔 Stop right there!

Only group admins have the VIP pass for this command. 😎`
        });

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
