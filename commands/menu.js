const fs = require("fs");

module.exports = {
    name: "menu",

    description: "Show available commands",

    category: "general",

    execute: async (sock, msg) => {

        const files = fs.readdirSync("./commands");

        let menu = "📌 MENU\n\nCommands:\n";

        for (const file of files) {

            const command = require("./" + file);

            if (command.name) {
                menu += `• .${command.name}\n`;
            }
        }

        menu += `\nTotal Commands: ${files.length}`;

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: menu
            }
        );
    }
};
