module.exports = {

    name: "whois",

    description: "Show chat information",

    category: "tools",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        let text =
`📌 Chat Information

JID:
${jid}

Type:
${jid.endsWith("@g.us") ? "Group" : "Private"}

From Me:
${msg.key.fromMe ? "Yes" : "No"}`;


        if (jid.endsWith("@g.us")) {

            const meta =
                await sock.groupMetadata(jid);

            text +=
`\n\nGroup Name:
${meta.subject}

Members:
${meta.participants.length}`;

        }


        await sock.sendMessage(jid, {
            text
        });

    }

};
