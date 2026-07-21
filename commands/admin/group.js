const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");
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
                text: t("group_only")
            });
        }

        const option = args[0]?.toLowerCase();

        if (!["open", "close"].includes(option)) {
            return sock.sendMessage(jid, {
                
                text:
`${t("invalid_option")}

${t("usage")}
.group open
.group close`
            });
        }

        try {

            const groups = require("../../lib/groups");
            if (option === "close") {

    await groups.setClose(sock, jid);

} else {

    await groups.setOpen(sock, jid);

            }

            await sock.sendMessage(jid, {
                text:
option === "close"
    ? t("group_closed")
    : t("group_opened")
            });

        } catch (err) {

            console.log(err);

            await sock.sendMessage(jid, {
                text: t("group_update_failed")
            });

        }

    }

};
