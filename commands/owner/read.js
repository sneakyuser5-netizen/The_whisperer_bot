const read = require("../../lib/read");

module.exports = {

    name: "read",

    description: "Enable or disable auto read",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const option = args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: "Usage:\n.read on\n.read off"
            });

        }

        read.set(
            msg.key.participant || jid,
            option === "on"
        );

        await sock.sendMessage(jid, {
            text:
                option === "on"
                ? "✅ Auto read enabled."
                : "✅ Auto read disabled."
        });

    }

};
