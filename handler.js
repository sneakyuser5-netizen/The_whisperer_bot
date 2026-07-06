const fs = require("fs");

const commands = new Map();

function loadCommands() {
    const files = fs.readdirSync("./commands");

    for (const file of files) {
        const command = require("./commands/" + file);

        commands.set(command.name, command);
    }

    console.log("✅ Commands loaded:", [...commands.keys()]);
}


async function handleMessage(sock, msg) {

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text;

    if (!text) return;

    const sender = msg.key.remoteJid;

    const cmd = text
        .toLowerCase()
        .trim()
        .replace(".", "");

    const command = commands.get(cmd);

    if (!command) return;

    await command.execute(sock, msg);
}


module.exports = {
    loadCommands,
    handleMessage
};
