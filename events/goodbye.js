const settings = require("../lib/settings");

module.exports = {

    name: "goodbye",

    trigger: "group-participants.update",

    execute: async (sock, update) => {

        console.log("GOODBYE EVENT:", update);

        const group = update.id;

        if (!settings.get(group).goodbye) return;

        if (update.action !== "remove") return;

        for (const user of update.participants) {
    console.log("LEAVING USER:", user);

            await sock.sendMessage(group, {
                text:
`👋 Goodbye @${user.split("@")[0]}

We hope to see you again!`,
                mentions: [user]
            });

        }

    }

};
