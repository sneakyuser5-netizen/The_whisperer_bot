const { t } = require("../../lib/lang");

module.exports = {
    name: "whois",
    description: "Show chat information",
    category: "tools",
    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        // Private chat - keep simple
        if (!jid.endsWith("@g.us")) {
            const text = 
`${t("tools.whois_title")}

${t("tools.whois_jid")}
${jid}

${t("tools.whois_type")}
${t("tools.whois_private")}

${t("tools.whois_fromme")}
${msg.key.fromMe ? t("yes") : t("no")}`;

            return await sock.sendMessage(jid, { text });
        }

        try {
            const meta = await sock.groupMetadata(jid);

            const creation = meta.creation ? new Date(meta.creation * 1000).toLocaleString() : t("tools.whois_hidden");
            const desc = meta.desc?.desc || meta.desc || t("tools.whois_no_desc");
            
            // OWNER FIX: owner field is often empty, superadmin is the real owner
            let ownerJid = meta.owner;
            if (!ownerJid) {
                const superAdmin = meta.participants.find(p => p.admin === 'superadmin');
                if (superAdmin) ownerJid = superAdmin.id;
            }

            const ownerMention = ownerJid ? `@${ownerJid.split('@')[0]}` : t("tools.whois_hidden");

            const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const adminsMentions = admins.map(p => p.id);

            // For @The whisperer style -> @number in text + mentions array
            const adminsText = admins.length 
                ? admins.map(p => `@${p.id.split('@')[0]}`).join(', ') 
                : t("tools.whois_no_admins");

            let inviteLink = t("tools.whois_no_invite");
            try {
                const code = await sock.groupInviteCode(jid);
                inviteLink = `https://chat.whatsapp.com/${code}`;
            } catch {}

            let picUrl = null;
            try {
                picUrl = await sock.profilePictureUrl(jid, 'image');
            } catch {}

            // Build caption - NO profile photo URL anymore
            // Restrict = only admins can edit group info / Announce = only admins can send messages
            const caption =
`${t("tools.whois_title")}

${t("tools.whois_jid")}
${jid}

${t("tools.whois_type")}
${t("tools.whois_group")}

${t("tools.whois_fromme")}
${msg.key.fromMe ? t("yes") : t("no")}

${t("tools.whois_group_name")}
${meta.subject}

${t("tools.whois_created")}
${creation}

${t("tools.whois_owner")}
${ownerMention}

${t("tools.whois_desc")}
${desc}

${t("tools.whois_members")}
${meta.participants.length}

${t("tools.whois_admins_count")}
${admins.length}

${t("tools.whois_admins")}
${adminsText}

${t("tools.whois_restrict")}
${meta.restrict ? t("yes") : t("no")}

${t("tools.whois_announce")}
${meta.announce ? t("yes") : t("no")}

${t("tools.whois_invite")}
${inviteLink}`;

            const allMentions = [...new Set([ownerJid, ...adminsMentions].filter(Boolean))];

            if (picUrl) {
                await sock.sendMessage(jid, {
                    image: { url: picUrl },
                    caption: caption,
                    mentions: allMentions
                });
            } else {
                await sock.sendMessage(jid, {
                    text: caption,
                    mentions: allMentions
                });
            }

        } catch (e) {
            await sock.sendMessage(jid, { text: `${t("tools.whois_error")} ${e.message}` });
        }
    }
};
