const os = require("os");
const sudo = require("../../lib/sudo");
const settings = require("../../lib/settings");
const identity = require("../../lib/identity");

module.exports = {

name:"bot",

description:"Show bot information",

category:"info",

permission:"public",

execute: async(sock,msg)=>{

const jid=msg.key.remoteJid;

const uptime=Math.floor(
(process.uptime())
);

const h=Math.floor(uptime/3600);

const m=Math.floor((uptime%3600)/60);

const s=uptime%60;

const owner=identity.getBotOwner();

const sudos=sudo.all(owner).length;

const mode=settings.get("global").mode||"private";

const text=

`🤖 *WhisperBot*

━━━━━━━━━━━━━━

👑 Creator
THE-WHISPERER-237

🤖 Bot Owner
${owner}

🛡️ Sudo Members
${sudos}

🌍 Mode
${mode}

⚙️ Platform
${os.platform()}

📦 Node
${process.version}

⏱️ Uptime
${h}h ${m}m ${s}s

━━━━━━━━━━━━━━`;

await sock.sendMessage(jid,{
text
});

}

};
