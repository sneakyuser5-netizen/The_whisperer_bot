const settings = require("../lib/settings");
module.exports = {

    name: "welcome",

    trigger: "group-participants.update",

    execute: async (sock, update) => {

    const { id, participants, action } = update;

    if (action !== "add") return;


    for (const participant of participants) {

        const user = participant.id || participant;

        const group = update.id;

if (!settings.get(group).welcome) {
    return;
}
        await sock.sendMessage(id, {
            text:
`👋 Welcome @${user.split("@")[0]}

Welcome to the group.
Enjoy your stay!`,
            mentions: [user]
        });

    }

}
};
