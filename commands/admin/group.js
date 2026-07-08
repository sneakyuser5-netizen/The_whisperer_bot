module.exports = {

    name: "group",

    description: "Open or close the group",

    category: "admin",

    permission: "admin",

    usage: ".group open|close",

    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }

        const option = args[0]?.toLowerCase();

        if (!["open", "close"].includes(option)) {
            return sock.sendMessage(jid, {
                text:
`❌ Invalid option.

Usage:
.group open
.group close`
            });
        }

        try {

            await sock.groupSettingUpdate(
                jid,
                option === "close"
                    ? "announcement"
                    : "not_announcement"
            );

            await sock.sendMessage(jid, {
                text:
                    option === "close"
                        ? "🔒 Group closed.\nOnly admins can send messages."
                        : "🔓 Group opened.\nEveryone can send messages."
            });

        } catch (err) {

            console.log(err);

            await sock.sendMessage(jid, {
                text: "❌ Failed to update group settings.\nMake sure I am an admin."
            });

        }

    }

};
