module.exports = {

    name: "leave",

    description: "Make the bot leave the current group",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });

        }

        await sock.sendMessage(jid, {
            text: "👋 Goodbye!"
        });

        await sock.groupLeave(jid);

    }

};
