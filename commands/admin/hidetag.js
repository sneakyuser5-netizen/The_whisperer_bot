const { t } = require("../../lib/lang");

module.exports = {

    name: "hidetag",

    description: "Mention all group members without showing their numbers",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        const metadata = await sock.groupMetadata(jid);

        const mentions = metadata.participants.map(
            member => member.id
        );

        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        await sock.sendMessage(
            jid,
            {
                text: text.replace(/^.*?hidetag\s*/i, "") || 
                      t(jid, "admin.hidetag_default"),
                mentions
            }
        );

    }

};
