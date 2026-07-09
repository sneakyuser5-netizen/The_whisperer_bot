module.exports = {

    name: "alive",

    description: "Check if bot is alive",

    category: "info",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;


        await sock.sendMessage(jid, {
            text:
`🤖 *WHISPER BOT IS ALIVE*

👑 Owner:
THE-WHISPERER-237

⚡ Status:
Running perfectly ✅

😂 I'm awake... unfortunately for my bugs.`
        });

    }

};
