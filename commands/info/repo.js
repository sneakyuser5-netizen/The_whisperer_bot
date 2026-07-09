module.exports = {

    name: "repo",

    description: "Show bot repository",

    category: "info",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;


        await sock.sendMessage(jid, {
            text:
`📦 *BOT REPOSITORY*

🤖 Project:
Whisper Bot

👑 Owner:
THE-WHISPERER-237

🔗 GitHub:
(Add your repository link here)

⭐ Feel free to support the project.`
        });

    }

};
