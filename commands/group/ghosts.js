const activity = require("../../lib/activity");
const identity = require("../../lib/identity");

module.exports = {

    name: "ghosts",

    description: "List members who have never spoken",

    category: "group",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const metadata =
            await sock.groupMetadata(jid);

        const active =
            activity.getGroup(jid);

        const ghosts = [];

        for (const member of metadata.participants) {

            const id =
                identity.normalize(member.id);

            // Skip the bot
if (
    identity.normalize(member.id) ===
    identity.normalize(sock.user.id)
) {
    continue;
}

            if (!active[id]) {
                ghosts.push(member.id);
            }

        }

        if (!ghosts.length) {

            return sock.sendMessage(jid, {
                text:
"🎉 No ghost members found.\n\nEveryone has spoken at least once."
            });

        }

        let text =
`👻 Ghost Members

👥 Total: ${ghosts.length}

`;

        ghosts.forEach((id, i) => {

            text += `${i + 1}. @${id.split("@")[0]}\n`;

        });

        text +=
"\n😂 These members have never spoken since activity tracking began.";

        await sock.sendMessage(jid, {
            text,
            mentions: ghosts
        });

    }

};
