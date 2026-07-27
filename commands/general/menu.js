module.exports = {

    name: "menu",

    category: "general",

    description: "Show bot commands",

    permission: "public",

    execute: async (sock, msg) => {

        const { t } = require("../../lib/lang");
        const { commands } = require("../../handler");

        const jid = msg.key.remoteJid;

        let menu =
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      🤖 *WhisperBot*
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

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

            menu += `

╭───『 *${category.toUpperCase()}* 』───╮
`;

            for (const command of categories[category]) {

                menu += `│ ➤ *.${command.name}*\n`;
                menu += `│    ${t(command.name)}\n`;
                menu += "│\n";

            }

            menu += "╰────────────────────╯\n";

        }

        menu += `

📚 *${t("total_commands")}:* ${commands.size}`;

        await sock.sendMessage(jid, {
            text: menu
        });

    }

};
