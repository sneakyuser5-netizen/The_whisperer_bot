const fs = require("fs");

const commands = new Map();
let commandList = [];

// load all commands
function loadCommands() {
    commands.clear();
    commandList = [];

    const commandFiles = fs.readdirSync("./commands");

    for (const file of commandFiles) {
        const cmd = require("./commands/" + file);

        commands.set(cmd.name, cmd);
        commandList.push(cmd.name);
    }

    console.log("✅ Commands loaded:", commandList.join(", "));
}

// handle messages
async function handleMessage(sock, msg) {
    try {

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const sender = msg.key.remoteJid;
        const cmd = text.toLowerCase().trim();
        if (cmd === ".menu") {

    const list = getCommandList();

    await sock.sendMessage(sender, {
        text:
`📌 MENU

Available Commands:
${list.map(c => `• ${c}`).join("\n")}

Total: ${list.length} commands`
    });

    return;
}

        const cleanCmd = cmd.replace(".", "");

        if (commands.has(cleanCmd)) {
            const command = commands.get(cleanCmd);
            await command.execute(sock, msg);
            return true;
        }

        return false;

    } catch (err) {
        console.log("Handler error:", err);
    }
}

// expose command list for menu
function getCommandList() {
    return commandList;
}

module.exports = {
    loadCommands,
    handleMessage,
    getCommandList
};

