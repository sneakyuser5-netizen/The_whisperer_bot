module.exports = {

    name: "vv",

    description: "Retrieve view once media",

    category: "tools",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const quoted =
            msg.message?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage;


        if (!quoted) {

            return sock.sendMessage(jid, {
                text: "❌ Reply to a view once message."
            });

        }


        const view =
            quoted.viewOnceMessage ||
            quoted.viewOnceMessageV2;


        if (!view) {

            return sock.sendMessage(jid, {
                text: "❌ This is not a view once message."
            });

        }


        const content = view.message;


        await sock.sendMessage(
            jid,
            content
        );

    }

};
