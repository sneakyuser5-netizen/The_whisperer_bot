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

                    name =
                        contact.name ||
                        contact.notify ||
                        contact.verifiedName ||
                        contact.pushName ||
                        name;
                }

            } catch {}

            /*
             * Fetch profile status / About.
             */
            if (phoneNumber) {

                try {

                    const profile =
                        await sock.fetchStatus(realJid);

                    if (profile?.status) {
                        about = profile.status;
                    }

                } catch {}
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
             * Final number.
             */
            const displayNumber =
                phoneNumber
                    ? `+${phoneNumber}`
                    : "Unavailable";

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
