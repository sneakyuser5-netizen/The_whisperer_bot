const status = require("../lib/status");


module.exports = {

    name: "status",

    trigger: "messages.upsert",


    execute: async (sock, data) => {


        const msg = data.messages?.[0];


        if (!msg) return;


        const jid = msg.key.remoteJid;


        if (jid !== "status@broadcast") return;


        const owner =
            sock.user.id.split(":")[0]
            + "@s.whatsapp.net";


        if (!status.get(owner)) return;


        await sock.sendMessage(
            owner,
            {
                forward: msg
            }
        );


    }

};
