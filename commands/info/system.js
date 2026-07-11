const os = require("os");

module.exports={

name:"system",

description:"Server information",

category:"info",

permission:"public",

execute:async(sock,msg)=>{

const jid=msg.key.remoteJid;

await sock.sendMessage(jid,{

text:

`💻 *System Information*

🖥️ Platform : ${os.platform()}

🏗️ Architecture : ${os.arch()}

⚙️ CPU : ${os.cpus().length} Core(s)

📦 Node : ${process.version}

😂 My tiny server is lifting heavy WhatsApp weights! 💪`

});

}

};
