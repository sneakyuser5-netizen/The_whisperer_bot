const { t } = require("../../lib/lang");
const identity = require("../../lib/identity");

module.exports = {

    name: "userinfo",

    description: "Show information about yourself or a mentioned user",

    category: "general",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        try {

            const context =
                msg.message?.extendedTextMessage?.contextInfo;

            const target =
                context?.mentionedJid?.[0] ||
                context?.participant ||
                msg.key.participant ||
                msg.key.remoteJid;

            const targetJid = String(target);

            let realJid = targetJid;

            let name = "Unknown";
            let about = "Not available";
            let role = "Member";

            /*
             * Resolve WhatsApp LID to the real phone JID.
             */
            if (targetJid.endsWith("@lid")) {

                try {

                    const mapping =
                        sock.signalRepository?.lidMapping;

                    if (
                        mapping &&
                        typeof mapping.getPhoneNumber === "function"
                    ) {

                        const phone =
                            mapping.getPhoneNumber(targetJid);

                        if (phone) {

                            const number =
                                String(phone)
                                    .replace("@s.whatsapp.net", "")
                                    .split(":")[0]
                                    .trim();

                            if (/^\d{7,15}$/.test(number)) {

                                realJid =
                                    `${number}@s.whatsapp.net`;
                            }
                        }
                    }

                } catch (err) {
                    console.log("Userinfo LID lookup error:", err);
                }
            }

            /*
             * Real phone number.
             */
            let phoneNumber = null;

            if (realJid.endsWith("@s.whatsapp.net")) {

                const number =
                    realJid
                        .replace("@s.whatsapp.net", "")
                        .split(":")[0];

                if (/^\d{7,15}$/.test(number)) {
                    phoneNumber = number;
                }
            }

            /*
             * Try to get contact information.
             */
            try {

                const contacts =
                    sock.store?.contacts || {};

                const contact =
                    contacts[realJid] ||
                    contacts[targetJid];

                if (contact) {

                    // Prefer several possible name fields
                    name =
                        contact.name ||
                        contact.notify ||
                        contact.verifiedName ||
                        contact.formattedName ||
                        contact.pushName ||
                        name;

                    // Prefer contact-provided about/status if available
                    about =
                        contact.status ||
                        contact.statusMessage ||
                        contact.bio ||
                        about;

                    // Try to recover phone number from contact if not already found
                    if (!phoneNumber) {
                        const maybe =
                            String(contact.id || contact.jid || "")
                                .replace("@s.whatsapp.net", "")
                                .split(":")[0]
                                .trim();

                        if (/^\d{7,15}$/.test(maybe)) {
                            phoneNumber = maybe;
                        }
                    }
                } else {
                    // If contact not in store, only derive a number fallback (do NOT use it as the display name)
                    const fallbackNumber =
                        targetJid.replace(/@.*$/, "").split(":")[0];

                    if (/^\d{7,15}$/.test(fallbackNumber)) {
                        if (!phoneNumber) phoneNumber = fallbackNumber;
                    }
                }

            } catch (e) {
                // swallow errors but log for debugging
                console.log("Userinfo contact lookup error:", e);
            }

            /*
             * Fetch profile status / About if still not available.
             */
            if ((!about || about === "Not available") && phoneNumber) {

                try {

                    const profile =
                        await sock.fetchStatus(`${phoneNumber}@s.whatsapp.net`);

                    if (profile?.status) {
                        about = profile.status;
                    }

                } catch (err) {
                    // ignore fetch errors
                }
            }

            /*
             * Group role.
             */
            if (jid.endsWith("@g.us")) {

                try {

                    const metadata =
                        await sock.groupMetadata(jid);

                    const member =
                        metadata.participants.find(p => {

                            const memberJid =
                                String(p.id || p.jid);

                            return (
                                memberJid === targetJid ||
                                memberJid === realJid ||
                                identity.normalize(memberJid) ===
                                identity.normalize(targetJid)
                            );
                        });

                    if (member) {

                        if (member.admin === "superadmin") {
                            role = "Group Creator";

                        } else if (member.admin) {
                            role = "Group Admin";
                        }

                    } else {

                        role = "Not a group member";
                    }

                } catch {}
            }

            /*
             * Bot privilege status.
             */
            if (identity.isBotOwner(msg)) {
                role = "Bot Owner";

            } else if (identity.isCreator(msg)) {
                role = "Creator";

            } else if (identity.isSudo(msg)) {
                role = "Sudo";
            }

            /*
             * Final number (fall back to extracting from targetJid when needed).
             */
            let displayNumber = "Unavailable";

            if (phoneNumber) {
                displayNumber = `+${phoneNumber}`;
            } else {
                const fallbackNumber =
                    targetJid.replace(/@.*$/, "").split(":")[0];

                if (/^\d{7,15}$/.test(fallbackNumber)) {
                    displayNumber = `+${fallbackNumber}`;
                }
            }

            await sock.sendMessage(jid, {

                text:
`${t(jid, "general.userinfo_title")}

${t(jid, "general.userinfo_name")}: ${name}
${t(jid, "general.userinfo_number")}: ${displayNumber}
${t(jid, "general.userinfo_about")}: ${about}
${t(jid, "general.userinfo_role")}: ${role}`

            });

        } catch (err) {

            console.log("Userinfo error:", err);

            await sock.sendMessage(jid, {
                text: t(jid, "general.userinfo_failed")
            });

        }

    }

};
