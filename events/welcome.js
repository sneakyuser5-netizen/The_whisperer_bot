module.exports = {

    name: "welcome",

    trigger: "group-participants.update",

    execute: async (sock, update) => {

    const { id, participants, action } = update;

    if (action !== "add") return;


    for (const participant of participants) {

        const user = participant.id || participant;

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