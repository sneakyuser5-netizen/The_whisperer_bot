const { t } = require("../../lib/lang");

module.exports = {

    name: "leave",

    description: "Make the bot leave the current group",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {

            return sock.sendMessage(jid, {
                text: t("group_only")
            });

        }

        await sock.sendMessage(jid, {
            text: t("owner.leave_goodbye")
        });

        await sock.groupLeave(jid);

    }

};
