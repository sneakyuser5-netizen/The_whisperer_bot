const groups = require("../../lib/groups");
const { t } = require("../../lib/lang");

module.exports = {

    name: "kick",

    description: "Remove a member from the group",

    category: "admin",

    permission: "admin",

    usage: ".kick @user",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const context = msg.message?.extendedTextMessage?.contextInfo;

        console.log("KICK CONTEXT:", context);

        let target = context?.mentionedJid?.[0];

        if (!target && context?.participant) {
            target = context.participant;
        }

        if (!target) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.kick_usage")
            });
        }

        try {

            await groups.remove(
                sock,
                jid,
                target
            );

            await sock.sendMessage(jid, {
                text: t(jid, "admin.kick_success")
            });

        } catch (err) {

            console.log("Kick error:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "admin.kick_failed")
            });

        }

    }
};
