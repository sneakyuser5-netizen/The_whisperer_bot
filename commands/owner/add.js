const { t } = require("../../lib/lang");

module.exports = {
    name: "add",
    description: "Add a member to the current group",
    category: "owner",
    permission: "owner",
    usage: ".add <phone number>",
    minArgs: 1,

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        // Must be used inside a group
        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "group_only")
            });
        }

        // Get number
        let number = args[0]
            .replace(/[^0-9]/g, "");

        if (!number) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.add_invalid")
            });
        }

        const userJid = `${number}@s.whatsapp.net`;

        try {

            await sock.sendMessage(jid, {
                text: t(jid, "owner.add_adding")
                    .replace("{{number}}", `+${number}`)
            });

            const result =
                await sock.groupParticipantsUpdate(
                    jid,
                    [userJid],
                    "add"
                );

            console.log(
                "ADD RESULT:",
                JSON.stringify(result, null, 2)
            );

            const response =
                Array.isArray(result)
                    ? result[0]
                    : result;

            if (
                response?.status === "200" ||
                response?.status === 200
            ) {

                return sock.sendMessage(jid, {
                    text: t(jid, "owner.add_success")
                        .replace(
                            "{{number}}",
                            `+${number}`
                        )
                });

            }

            return sock.sendMessage(jid, {
                text: t(jid, "owner.add_failed")
                    .replace(
                        "{{number}}",
                        `+${number}`
                    )
            });

        } catch (error) {

            console.error(
                "ADD MEMBER ERROR:",
                error
            );

            return sock.sendMessage(jid, {
                text: t(jid, "owner.add_failed")
                    .replace(
                        "{{number}}",
                        `+${number}`
                    )
            });
        }
    }
};
