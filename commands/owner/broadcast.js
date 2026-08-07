const { t } = require("../../lib/lang");

module.exports = {

    name: "broadcast",
    description: "Broadcast a message to all groups",
    category: "owner",
    permission: "owner",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        const message = args.join(" ").trim();

        if (!message) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.broadcast_usage")
            });
        }

        const groups = await sock.groupFetchAllParticipating();

        const ids = Object.keys(groups);

        let sent = 0;

        for (const group of ids) {

            try {

                await sock.sendMessage(group, {
                    text: `📢 *Broadcast*\n\n${message}`
                });

                sent++;

                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (err) {
                console.log("Broadcast failed:", group);
            }

        }

        await sock.sendMessage(jid, {
            text: t(jid, "owner.broadcast_done")
                .replace("{count}", sent)
        });

    }

};
