const { t } = require("../../lib/lang");

module.exports = {
    name: "whois",
    description: "Show chat information",
    category: "tools",

    execute: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        // =========================
        // PRIVATE CHAT
        // =========================
        if (!jid.endsWith("@g.us")) {
            try {
                let userJid = jid;
                let phoneJid = null;

                // Resolve LID -> actual phone-number JID
                if (jid.endsWith("@lid")) {
                    try {
                        if (
                            typeof sock.signalRepository?.lidMapping?.getPNForLID ===
                            "function"
                        ) {
                            phoneJid =
                                await sock.signalRepository.lidMapping.getPNForLID(jid);
                        }
                    } catch {}

                    try {
                        if (!phoneJid && typeof sock.getPNForLID === "function") {
                            phoneJid = await sock.getPNForLID(jid);
                        }
                    } catch {}
                }

                if (phoneJid && typeof phoneJid === "string") {
                    userJid = phoneJid;
                }

                // Profile picture
                let picUrl = null;

                try {
                    picUrl = await sock.profilePictureUrl(userJid, "image");
                } catch {
                    try {
                        picUrl = await sock.profilePictureUrl(jid, "image");
                    } catch {}
                }

                // Contact information
                let contact = null;

                try {
                    contact = sock.store?.contacts?.[jid] || null;
                } catch {}

                if (!contact && phoneJid) {
                    try {
                        contact = sock.store?.contacts?.[phoneJid] || null;
                    } catch {}
                }

                // Push name
                const pushName =
                    contact?.name ||
                    contact?.notify ||
                    msg.pushName ||
                    t("tools.whois_not_available");

                // About / bio
                let about = null;
                let aboutTimestamp = null;

                try {
                    // Remove device suffix such as :0
                    const statusJid =
                        typeof userJid === "string"
                            ? userJid.replace(
                                  /:\\d+(?=@s\\.whatsapp\\.net)$/,
                                  ""
                              )
                            : userJid;

                    const result = await sock.fetchStatus(statusJid);

                    if (Array.isArray(result) && result.length > 0) {
                        const entry = result[0];

                        if (entry?.status) {
                            if (typeof entry.status === "string") {
                                about = entry.status;
                            } else {
                                about =
                                    entry.status.status ||
                                    entry.status.text ||
                                    null;

                                aboutTimestamp =
                                    entry.status.setAt ||
                                    entry.status.t ||
                                    entry.status.timestamp ||
                                    null;
                            }
                        }
                    }
                } catch {}

                // Contact's phone number
                let phoneNumber = null;

                if (
                    phoneJid &&
                    phoneJid.endsWith("@s.whatsapp.net")
                ) {
                    phoneNumber = phoneJid
                        .split("@")[0]
                        .split(":")[0];
                } else if (jid.endsWith("@s.whatsapp.net")) {
                    phoneNumber = jid
                        .split("@")[0]
                        .split(":")[0];
                }

                // LID
                const lid = jid.endsWith("@lid") ? jid : null;

                // WhatsApp account creation/join date is not normally
                // exposed through Baileys.
                const joinedWhatsApp = t("tools.whois_not_available");

                // About timestamp
                let aboutDate = null;

                if (aboutTimestamp) {
                    try {
                        const ts = Number(aboutTimestamp);

                        if (Number.isFinite(ts)) {
                            const milliseconds =
                                ts < 10000000000 ? ts * 1000 : ts;

                            aboutDate = new Date(
                                milliseconds
                            ).toLocaleString();
                        }
                    } catch {}
                }

                const caption =
`${t("tools.whois_title")}

${t("tools.whois_jid")}
${jid}

${t("tools.whois_type")}
${t("tools.whois_private")}

${t("tools.whois_fromme")}
${msg.key.fromMe ? t("yes") : t("no")}

${t("tools.whois_push_name")}
${pushName}

${t("tools.whois_phone_number")}
${phoneNumber ? `+${phoneNumber}` : t("tools.whois_not_available")}

${t("tools.whois_lid")}
${lid || t("tools.whois_not_available")}

${t("tools.whois_bio")}
${about ? about : t("tools.whois_no_bio")}

${t("tools.whois_bio_updated")}
${aboutDate || t("tools.whois_not_available")}

${t("tools.whois_whatsapp_joined")}
${joinedWhatsApp}`;

                if (picUrl) {
                    await sock.sendMessage(jid, {
                        image: { url: picUrl },
                        caption
                    });
                } else {
                    await sock.sendMessage(jid, {
                        text: caption
                    });
                }

            } catch (e) {
                await sock.sendMessage(jid, {
                    text: `${t("tools.whois_error")} ${e.message}`
                });
            }

            return;
        }

        // =========================
        // GROUP CHAT
        // =========================
        try {
            const meta = await sock.groupMetadata(jid);

            const creation = meta.creation
                ? new Date(meta.creation * 1000).toLocaleString()
                : t("tools.whois_hidden");

            const desc =
                meta.desc?.desc ||
                meta.desc ||
                t("tools.whois_no_desc");

            // OWNER
            let ownerJid = null;

            if (typeof meta.owner === "string") {
                ownerJid = meta.owner;
            } else if (meta.owner?.id || meta.owner?.jid) {
                ownerJid = meta.owner.id || meta.owner.jid;
            }

            // Superadmin fallback
            if (!ownerJid) {
                const superAdmin = meta.participants.find(
                    p => p.admin === "superadmin"
                );

                if (superAdmin) {
                    ownerJid = superAdmin.id;
                }
            }

            const ownerMention = ownerJid
                ? `@${ownerJid.split("@")[0]}`
                : t("tools.whois_hidden");

            // ADMINS
            const admins = meta.participants.filter(
                p =>
                    p.admin === "admin" ||
                    p.admin === "superadmin"
            );

            const adminsMentions = admins.map(p => p.id);

            const adminsText = admins.length
                ? admins
                      .map(p => `@${p.id.split("@")[0]}`)
                      .join(", ")
                : t("tools.whois_no_admins");

            // INVITE LINK
            let inviteLink = t("tools.whois_no_invite");

            try {
                const code = await sock.groupInviteCode(jid);
                inviteLink = `https://chat.whatsapp.com/${code}`;
            } catch {}

            // GROUP PROFILE PICTURE
            let picUrl = null;

            try {
                picUrl = await sock.profilePictureUrl(jid, "image");
            } catch {}

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

            const allMentions = [
                ...new Set(
                    [ownerJid, ...adminsMentions].filter(Boolean)
                )
            ];

            if (picUrl) {
                await sock.sendMessage(jid, {
                    image: { url: picUrl },
                    caption,
                    mentions: allMentions
                });
            } else {
                await sock.sendMessage(jid, {
                    text: caption,
                    mentions: allMentions
                });
            }

        } catch (e) {
            await sock.sendMessage(jid, {
                text: `${t("tools.whois_error")} ${e.message}`
            });
        }
    }
};
