module.exports = {

    name: "purge",

    description: "Delete recent messages",

    category: "admin",

    permission: "admin",

    usage: ".purge 10",

    minArgs: 1,


    execute: async (sock, msg, args) => {

        const jid =
            msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text:
                "❌ This command only works in groups."
            });

        }


        const amount =
            Number(args[0]);


        if (
            isNaN(amount) ||
            amount < 1 ||
            amount > 100
        ) {

            return sock.sendMessage(jid, {
                text:
                "❌ Use:\n.purge 10\n\nMaximum: 100 messages."
            });

        }


        const context =
            msg.message?.extendedTextMessage
            ?.contextInfo;


        if (!context?.stanzaId) {

            return sock.sendMessage(jid, {
                text:
                "❌ Reply to a message first.\n\nExample:\nReply → .purge 10"
            });

        }


        const messages =
            global.messageCache?.[jid];


        if (!messages) {

            return sock.sendMessage(jid, {
                text:
                "❌ I don't have enough message history yet."
            });

        }


        const index =
            messages.findIndex(
                m => m.key.id === context.stanzaId
            );


        if (index === -1) {

            return sock.sendMessage(jid, {
                text:
                "❌ Message not found in memory."
            });

        }


        const selected =
            messages.slice(
                Math.max(0, index - amount),
                index + 1
            );


        for (const m of selected) {

            await sock.sendMessage(jid, {
                delete: m.key
            });

        }


        await sock.sendMessage(jid, {
            text:
`🧹 Deleted ${selected.length} messages.

😂 Cleanup crew has finished the job.`
        });


    }

};
