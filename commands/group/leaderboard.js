const activity = require("../../lib/activity");
const identity = require("../../lib/identity");

module.exports = {

    name: "leaderboard",

    description: "Show the most active group members",

    category: "group",

    permission: "any",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const board = activity.leaderboard(jid);
        const metadata = await sock.groupMetadata(jid);

        if (!board.length) {
            return sock.sendMessage(jid, {
                text: "📭 No activity has been recorded yet."
            });
        }

        const top = board.slice(0, 10);
        const totalMessages = board.reduce(
    (sum, [, data]) => sum + data.messages,
    0
);

        let text =
`🏆 Group Leaderboard

👥 Top ${top.length} Most Active Members

`;

        const mentions = [];

        top.forEach(([user, data], index) => {

            const member = metadata.participants.find(
    p => identity.normalize(p.id) === user
);

if (member) {
    mentions.push(member.id);
}

            const medal =
                index === 0 ? "🥇" :
                index === 1 ? "🥈" :
                index === 2 ? "🥉" :
                `${index + 1}.`;

            const percent = totalMessages
    ? ((data.messages / totalMessages) * 100).toFixed(1)
    : "0.0";

text +=
`${medal} @${user} — ${data.messages} messages (${percent}%)\n`;

        });

        text += "\n😂 Keep chatting to climb the rankings!";

        await sock.sendMessage(jid, {
            text,
            mentions
        });

    }

};
