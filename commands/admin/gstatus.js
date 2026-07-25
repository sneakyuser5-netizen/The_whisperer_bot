const {
    downloadMediaMessage,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const { t } = require("../../lib/lang");

module.exports = {

    name: "gstatus",

    description: t("en", "gstatus"), // "Post replied media to group members' status"

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        console.log("GSTATUS STARTED");

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.only_groups")
            });
        }

        // Check admin
        const groupMetadata = await sock.groupMetadata(jid);
        const sender = msg.key.participant;
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (!isAdmin) return sock.sendMessage(jid, { text: t(jid, "admin.not_admin") });

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.gstatus_reply_media")
            });
        }

        try {
            // Get all group member JIDs
            const statusJidList = groupMetadata.participants
                .map(p => jidNormalizedUser(p.id));

            console.log("STATUS RECIPIENTS:", statusJidList.length);

            let content = {};
            let mtype = '';

            if (quoted.imageMessage) {
                mtype = 'image'
                const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
                content = {
                    image: buffer,
                    caption: quoted.imageMessage.caption || ""
                };
            } else if (quoted.videoMessage) {
                mtype = 'video'
                const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
                content = {
                    video: buffer,
                    caption: quoted.videoMessage.caption || ""
                };
            } else {
                return sock.sendMessage(jid, {
                    text: t(jid, "admin.gstatus_only_supported")
                });
            }

            // THE FIX: add mentions and statusPrivacy to target group members
            await sock.sendMessage(
                "status@broadcast",
                {
                    ...content,
                    mentions: statusJidList, // this makes it show to them first
                    statusMentionJid: statusJidList // new baileys key
                }
            );

            await sock.sendMessage(jid, {
                text: `✅ Status posted! Sent to ${statusJidList.length} group members`
            });

        } catch (err) {
            console.log("GSTATUS ERROR:", err);
            await sock.sendMessage(jid, {
                text: t(jid, "admin.gstatus_failed") + `\n${err}`
            });
        }

    }

};
