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

        let sent = 0;
        let failed = 0;

        for (const groupId of Object.keys(groups)) {

            try {

                await sock.sendMessage(groupId, {
                    text: `📢 *Broadcast*\n\n${message}`
                });

                sent++;

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

            } catch (err) {

                failed++;
                console.log("Broadcast failed:", groupId);

            }

        }

        console.log(
            `Broadcast completed. Sent: ${sent}, Failed: ${failed}`
        );

    }

};
