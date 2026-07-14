const identity = require("../lib/identity");

module.exports = {

    name: "antispam",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        if (!msg.message) return;

        if (msg.key.fromMe) return;


        const jid =
            msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) return;


        const sender =
            identity.getSender(msg);


        const mentionId =
            msg.key.participant || sender;



        const metadata =
            await sock.groupMetadata(jid);



        const member =
            metadata.participants.find(p => {

                const id =
                    identity.normalize(p.id || "");

                return id === sender;

            });



        // Ignore admins
        if (member?.admin) return;



        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";


        if (!text) return;



        global.spamTracker =
            global.spamTracker || {};



        const key =
            jid + ":" + sender;



        const now =
            Date.now();



        if (!global.spamTracker[key]) {

            global.spamTracker[key] = [];

        }



        global.spamTracker[key].push(now);



        // Keep only last 5 seconds
        global.spamTracker[key] =
            global.spamTracker[key]
            .filter(
                time => now - time < 5000
            );



        const count =
            global.spamTracker[key].length;



        if (count >= 5) {


            await sock.sendMessage(jid, {
                delete: msg.key
            });



            await sock.sendMessage(jid, {

                text:
`🚨 Spam detected!

😂 @${mentionId.split("@")[0]}, your fingers are faster than the bot.

Slow down before the group needs a timeout.`,

                mentions: [mentionId]

            });



            global.spamTracker[key] = [];

        }

    }

};
