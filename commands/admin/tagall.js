module.exports = {

    name: "tagall",

    description: "Tag all group members",

    category: "group",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const metadata = await sock.groupMetadata(jid);

        let text = "📢 Tagging everyone\n\n";

        let mentions = [];

        for (const member of metadata.participants) {

            text += `@${member.id.split("@")[0]}\n`;

            mentions.push(member.id);
        }

        await sock.sendMessage(
            jid,
            {
                text,
                mentions
            }
        );

    }
};