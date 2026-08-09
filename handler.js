const fs = require("fs");
const clear = require("./lib/clear");
const { t } = require("./lib/lang");
const config = require("./config");
const settings = require("./lib/settings");
const sudo = require("./lib/sudo");
const ownerDB = require("./lib/owner");
const commands = new Map();
const cooldowns = new Map();
const session = require("./lib/session");
async function isAdmin(sock, msg) {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith("@g.us")) {
        return false;
    }
    const metadata = await sock.groupMetadata(jid);
    const sender = msg.key.participant;
    const participant = metadata.participants.find(p => p.id === sender);
    return (participant?.admin === "admin" || participant?.admin === "superadmin");
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
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    const isTypingOn = settings.get("global").autotyping;
    if (isTypingOn && text) {
        const jid = msg.key.remoteJid;
        await sock.sendPresenceUpdate('composing', jid);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }



    if (!text) return;

    const sender = msg.key.remoteJid;
    const jid = msg.key.remoteJid;
    
    global.messageCache = global.messageCache || {};

global.messageCache[jid] = global.messageCache[jid] || [];

global.messageCache[jid].push(msg);

if (global.messageCache[jid].length > 100) {
    global.messageCache[jid].shift();
}
    const groupSettings = settings.get(jid);
    let prefix = groupSettings.prefix || "."; // let not const

    const identity = require("./lib/identity");
    //identity.debug(msg);
    const senderId = identity.getSender(msg);
    const isOwner = identity.isOwner(msg);
    const isSudo = identity.isSudo(msg);
    const mute = require("./lib/mute");

    if (jid.endsWith("@g.us") && mute.isMuted(jid, senderId) &&!identity.isCreator(msg) &&!identity.isBotOwner(msg) &&!isSudo) {
        return;
    }

    const mode = settings.get("global").mode || "private";

    let body = text.trim();

    

    if (body.startsWith(prefix + " ")) {
        body = prefix + body.slice(prefix.length + 1);
    }
    //if (!body.startsWith(prefix)) {
       // return;
   // }
// Handle interactive sessions
if (!body.startsWith(prefix)) {

    const current = session.get(jid);
//    console.log("SESSION FOUND:", current);
//console.log("BODY:", body);
if (current?.type === "kickall") {

    const answer = body.trim().toLowerCase();

    if (Date.now() > current.expires) {
        session.delete(jid);

        return sock.sendMessage(jid, {
            text: t(jid, "admin.kickall_expired")
        });
    }

    if (answer === "no") {
        session.delete(jid);

        return sock.sendMessage(jid, {
            text: t(jid, "admin.kickall_cancelled")
        });
    }

if (answer !== "yes") {
    return;
}
    session.delete(jid);

    let kicked = 0;
    let failed = 0;

    for (const member of current.members) {

        try {

            await sock.groupParticipantsUpdate(
                jid,
                [member.id],
                "remove"
            );

            kicked++;

        } catch (err) {

            console.dir(err, { depth: null });

            failed++;
        }
    }

    return sock.sendMessage(jid, {
        text: t(jid, "admin.kickall_done")
            .replace("{{count}}", kicked)
            .replace("{{failed}}", failed)
    });
}

    if (current?.type === "clear") {

        switch (body) {

    case "0":

        session.delete(jid);

        return sock.sendMessage(jid, {
            text: t(jid, "owner.clear_cancelled")
        });

    case "1": {

        session.delete(jid);

        const count = await clear.clearCurrent100(
            sock,
            jid
        );

        return sock.sendMessage(jid, {
            text: t(jid, "owner.clear_done")
                .replace("{{count}}", count)
        });

    }

    case "2": {

        session.delete(jid);

        const count = await clear.clearCurrentAll(
            sock,
            jid
        );

        return sock.sendMessage(jid, {
            text: t(jid, "owner.clear_done")
                .replace("{{count}}", count)
        });

    }

    case "3": {

        session.delete(jid);

        const count = await clear.clearPrivateChats(
            sock
        );

        return sock.sendMessage(jid, {
            text: t(jid, "owner.clear_done")
                .replace("{{count}}", count)
        });

    }

    case "4": {

        session.delete(jid);

        const count = await clear.clearGroupChats(
            sock
        );

        return sock.sendMessage(jid, {
            text: t(jid, "owner.clear_done")
                .replace("{{count}}", count)
        });

    }

    case "5": {

        session.delete(jid);

        const count = await clear.clearEverything(
            sock
        );

        return sock.sendMessage(jid, {
            text: t(jid, "owner.clear_done")
                .replace("{{count}}", count)
        });

    }

        }
            

    return;

}

}
    // Parse commands (.cmd arg) and (.cmd=arg)
const content = body.slice(prefix.length).trim();

const [commandPart, ...rest] = content.split(/\s+/);

const [cmdName, inlineArg] = commandPart.split("=");

const cmd = cmdName.toLowerCase();

const args = inlineArg
    ? [inlineArg, ...rest]
    : rest;

const command = commands.get(cmd);
if (!command) return;

    if (command.cooldown) {
        const now = Date.now();
        const user = sender;
        const key = `${command.name}:${user}`;
        const lastUsed = cooldowns.get(key);
        const cooldownTime = command.cooldown * 1000;
        if (lastUsed && now - lastUsed < cooldownTime) {
            const remaining = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
            await sock.sendMessage(sender, { text: `⏳ Please wait ${remaining}s before using this command again.` });
            return;
        }
        cooldowns.set(key, now);
    }

    const permission = command.permission || "public";

    // Private mode
    if (mode === "private" &&!isOwner &&!isSudo) {
        return sock.sendMessage(sender, { text: t("private_mode") });
    }
    // Creator only
    if (permission === "creator" &&!identity.isCreator(msg)) {
        return sock.sendMessage(sender, { text: t("creator_only") });
    }
    // Owner only
    if (permission === "owner" &&!isOwner) {
        return sock.sendMessage(sender, { text: t("owner_only") });
    }
    // Sudo
    if (permission === "sudo" &&!isOwner &&!isSudo) {
        return sock.sendMessage(sender, { text: t("sudo_only") });
    }
    // Admin commands
    if (permission === "admin") {
        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, { text: t("group_only") });
        }
        const admin = await isAdmin(sock, msg);
        if (!admin) {
            return sock.sendMessage(jid, { text: t("admin_only") });
        }
    }

    if (command.usage && command.minArgs) {
        if (args.length < command.minArgs) {
            await sock.sendMessage(sender, { text: `${t("missing_argument")}\n\n${t("usage")}\n${command.usage}` });
            return;
        }
    }

  //  console.log("COMMAND:", command.name);
    //console.log("ARGS:", args);
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
