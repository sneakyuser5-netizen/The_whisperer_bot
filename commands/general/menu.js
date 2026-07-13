module.exports = {

    name: "menu",

    category: "general",

    description: "Show bot commands",

    permission: "public",

    execute: async (sock, msg) => {
        const { t } = require("../../lib/lang");

        const { commands } = require("../../handler.js");

        const jid = msg.key.remoteJid;

let menu =
`${t(jid, "menu_title")}\n`;

        const categories = {};

        for (const [name, command] of commands.entries()) {

            if (name !== command.name) continue;

            const category = command.category || "other";

            if (!categories[category]) {
                categories[category] = [];
            }

            categories[category].push(command);
        }


        for (const category in categories) {

            menu += `\n📂 ${category.toUpperCase()}\n`;

            for (const command of categories[category]) {

                menu += `• .${command.name}`;

                if (command.description) {
                    menu += `\n  ${command.description}`;
                }

                menu += "\n";
            }
        }


        menu +=
`\n${t(jid, "total_commands")}: ${commands.size}`;

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: menu
            }
        );

    }
};
