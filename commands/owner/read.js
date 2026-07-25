const fs = require("fs");
const path = require("path");
const { t } = require("../../lib/lang");

const readFile = path.join(__dirname, "../../database/read.json");

// Make sure database folder exists
if (!fs.existsSync(path.dirname(readFile))) {
    fs.mkdirSync(path.dirname(readFile), { recursive: true });
}
if (!fs.existsSync(readFile)) {
    fs.writeFileSync(readFile, JSON.stringify({ global: false }, null, 2));
}

const getRead = () => JSON.parse(fs.readFileSync(readFile));
const setRead = (val) => fs.writeFileSync(readFile, JSON.stringify({ global: val }, null, 2));

module.exports = {
    name: "read",
    description: "Enable or disable auto read",
    category: "owner",
    permission: "owner",

    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const args = body.trim().split(/ +/).slice(1); // get args from message
        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {
            return sock.sendMessage(jid, {
                text: `*Usage:*.read on\n*Usage:*.read off`
            });
        }

        setRead(option === "on");

        await sock.sendMessage(jid, {
            text: option === "on"? `✅ Auto Read: *ON*` : `❌ Auto Read: *OFF*`
        });
    }
};
