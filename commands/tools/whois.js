const { t } = require("../../lib/lang");

module.exports = {
    name: "whois",
    description: "Show chat information",
    category: "tools",
    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        let text =
`${t("tools.whois_title")}

${t("tools.whois_jid")}
${jid}

${t("tools.whois_type")}
${jid.endsWith("@g.us") ? t("tools.whois_group") : t("tools.whois_private")}

${t("tools.whois_fromme")}
${msg.key.fromMe ? t("yes") : t("no")}`;

        if (jid.endsWith("@g.us")) {
            try {
                const meta = await sock.groupMetadata(jid);

                // More details
                const creation = meta.creation ? new Date(meta.creation * 1000).toLocaleString() : t("tools.whois_hidden");
                const owner = meta.owner ? meta.owner : t("tools.whois_hidden");
                const desc = meta.desc?.desc || meta.desc || t("tools.whois_no_desc");
                
                const admins = meta.participants.filter(p => p.admin !== null);
                const adminsList = admins.map(p => `${p.id.split('@')[0]} (${p.admin})`).join(', ') || t("tools.whois_no_admins");

                let inviteLink = t("tools.whois_no_invite");
                try {
                    const code = await sock.groupInviteCode(jid);
                    inviteLink = `https://chat.whatsapp.com/${code}`;
                } catch {}

                let picUrl = t("tools.whois_no_pic");
                try {
                    picUrl = await sock.profilePictureUrl(jid, 'image');
                } catch {}

                text +=
`\n\n${t("tools.whois_group_name")}
${meta.subject}

${t("tools.whois_created")}
${creation}

${t("tools.whois_owner")}
${owner}

${t("tools.whois_desc")}
${desc}

${t("tools.whois_members")}
${meta.participants.length}

${t("tools.whois_admins_count")}
${admins.length}

${t("tools.whois_admins")}
${adminsList}

${t("tools.whois_restrict")}
${meta.restrict ? t("yes") : t("no")}

${t("tools.whois_announce")}
${meta.announce ? t("yes") : t("no")}

${t("tools.whois_invite")}
${inviteLink}

${t("tools.whois_pic")}
${picUrl}`;

            } catch (e) {
                text += `\n\n${t("tools.whois_error")} ${e.message}`;
            }
        }

        await sock.sendMessage(jid, { text });
    }
};
