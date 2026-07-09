const settings = require("../lib/settings");

module.exports = {

    name: "goodbye",

    trigger: "group-participants.update",

    execute: async (sock, update) => {

        console.log("GOODBYE EVENT:", update);

        const group = update.id;

        if (!settings.get(group).goodbye) return;

        if (update.action !== "remove") return;

        for (const participant of update.participants) {

    console.log("LEAVING USER:", participant);

    const jid =
        typeof participant === "string"
            ? participant
            : participant.id ||
              participant.jid ||
              participant.phoneNumber ||
              participant.lid;

    if (!jid) continue;

    await sock.sendMessage(group, {
        text: `👋 Goodbye @${jid.split("@")[0]}

We hope to see you again!`,
        mentions: [jid]
    });

        }

    }

};
