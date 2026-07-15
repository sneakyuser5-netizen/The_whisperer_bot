const { exec } = require("child_process");

module.exports = {

    name: "restart",

    description: "Restart WhisperBot",

    category: "owner",

    permission: "sudo",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`🔄 Restarting WhisperBot...

😂 Hold my circuits together. I'll be back shortly!`
        });

        setTimeout(() => {
            exec("npx pm2 restart whisperbot");
        }, 2000);

    }

};
