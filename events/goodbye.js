const settings = require("../lib/settings");

module.exports = async (sock, update) => {
    console.log("GOODBYE EVENT:", update);

    const group = update.id;

    if (!settings.get(group).goodbye) {
        return;
    }

    if (update.action !== "remove") {
        return;
    }

    for (const user of update.participants) {

        await sock.sendMessage(group, {
            text:
`👋 Goodbye @${user.split("@")[0]}

We hope to see you again!`,
            mentions: [user]
        });

    }

};
