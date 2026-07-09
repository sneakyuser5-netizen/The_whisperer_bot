const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");


module.exports = {

    name: "gstatus",

    description: "Post replied media to WhatsApp status",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }


        const quoted =
            msg.message?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage;


        if (!quoted) {

            return sock.sendMessage(jid, {
                text: "❌ Reply to a photo or video."
            });

        }


        try {

            if (quoted.imageMessage) {

                const buffer = await downloadMediaMessage(
                    {
                        message: quoted
                    },
                    "buffer",
                    {}
                );


                await sock.sendMessage(
    "status@broadcast",
    {
        image: buffer,
        caption: quoted.imageMessage.caption || ""
    },
    {
        statusJidList: [
            sock.user.id.split(":")[0] + "@s.whatsapp.net"
        ]
    }
);

            }


            else if (quoted.videoMessage) {

                const buffer = await downloadMediaMessage(
                    {
                        message: quoted
                    },
                    "buffer",
                    {}
                );


                await sock.sendMessage(
    "status@broadcast",
    {
        video: buffer,
        caption: quoted.videoMessage.caption || ""
    },
    {
        statusJidList: [
            sock.user.id.split(":")[0] + "@s.whatsapp.net"
        ]
    }
);

            }


            else {

                return sock.sendMessage(jid, {
                    text: "❌ Only photos and videos are supported."
                });

            }


            await sock.sendMessage(jid, {
                text: "✅ Posted to WhatsApp status."
            });


        } catch (err) {

            console.log("GSTATUS ERROR:", err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to post status."
            });

        }

    }

};
