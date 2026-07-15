const { spawn } = require("child_process");

module.exports = {

    name: "restart",

    description: "Restart WhisperBot",

    category: "owner",

    permission: "sudo",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        await sock.sendMessage(jid, {
            text:
`🔄 Restart request accepted.

😂 Hold my circuits together... I'll be right back!`
        });

        setTimeout(() => {

            // Running inside Termux
            if (
                process.env.PREFIX &&
                process.env.PREFIX.includes("com.termux")
            ) {

                spawn(
                    "npm",
                    ["start"],
                    {
                        cwd: process.cwd(),
                        detached: true,
                        stdio: "ignore"
                    }
                ).unref();

            }

            // Exit current process.
            // On bot-hosting.net the panel restarts the bot.
            // On Termux the new process is already running.
            process.exit(0);

        }, 1500);

    }

};
