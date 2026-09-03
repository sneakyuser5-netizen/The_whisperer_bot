const settings = require("../lib/settings");

module.exports = {
    name: "antibot",
    trigger: "group-participants.update",

    execute: async (sock, update) => {
        if (update.action !== "add") return;

        const group = update.id;

        if (!settings.get(group).antibot) return;

        for (const participant of update.participants || []) {
            const user =
                typeof participant === "string"
                    ? participant
                    : participant.id || participant.jid;

            if (!user || !user.endsWith("@bot")) continue;

            try {
                await sock.groupParticipantsUpdate(
                    group,
                    [user],
                    "remove"
                );

                console.log(
                    `ANTIBOT: Removed bot ${user} from ${group}`
                );
            } catch (err) {
                console.log(
                    `ANTIBOT: Failed to remove ${user}:`,
                    err
                );
            }
        }
    }
};
