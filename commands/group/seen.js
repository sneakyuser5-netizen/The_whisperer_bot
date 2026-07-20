const activity = require("../../lib/activity");
const identity = require("../../lib/identity");

module.exports = {

    name: "seen",

    description: "Show when a user was last active",

    category: "group",

    permission: "admin",

    usage: ".seen @user",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const context =
            msg.message?.extendedTextMessage?.contextInfo;

        let target =
            context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text:
"❌ Reply to a user or mention them.\n\nExample:\n.seen @user"
            });
        }

        const user =
            identity.normalize(target);

        const last =
            activity.get(jid, user);

        if (!last) {

            return sock.sendMessage(jid, {
                text:
`👀 Last Seen

👤 User: @${target.split("@")[0]}

❌ No activity has been recorded since tracking was enabled.`,
                mentions: [target]
            });

        }

        const ago =
            activity.format(Date.now() - last);

        const date = new Date(last).toLocaleString("en-GB", {
    timeZone: "Africa/Douala",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

        await sock.sendMessage(jid, {
            text:
`👀 Last Seen

👤 User: @${target.split("@")[0]}

🕒 Last message:
${ago} ago

📅 Date:
${date}

😂 They've been quiet since then.`,
            mentions: [target]
        });

    }

};
