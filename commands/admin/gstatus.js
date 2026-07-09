module.exports = {

    name: "gstatus",

    description: "Change group description",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }


        if (!args.length) {
            return sock.sendMessage(jid, {
                text: "Usage:\n.gstatus Your group description"
            });
        }


        const description = args.join(" ");


        try {

            await sock.groupUpdateDescription(
                jid,
                description
            );


            await sock.sendMessage(jid, {
                text:
`✅ Group status updated.

New status:
${description}`
            });


        } catch (err) {

            console.log("GSTATUS ERROR:", err);

            await sock.sendMessage(jid, {
                text:
"❌ Failed to update group status. Make sure I am an admin."
            });

        }

    }

};
