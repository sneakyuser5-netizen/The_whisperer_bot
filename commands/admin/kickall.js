const { t } = require("../../lib/lang");
const session = require("../../lib/session");

module.exports = {
    name: "kickall",
    description: "Remove all non-admin members",
    category: "admin",
    permission: "admin",
    usage: ".kickall",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: t(jid, "group_only")
            });
        }

        const metadata = await sock.groupMetadata(jid);

        const myNumber = sock.user.id
            .split("@")[0]
            .split(":")[0];

        const members = metadata.participants.filter(p => {
            const number = p.id
                .split("@")[0]
                .split(":")[0];

            return !p.admin && number !== myNumber;
        });

        if (!members.length) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.kickall_none")
            });
        }

session.set(jid, {
    type: "kickall",
    members,
    expires: Date.now() + 30000
});

setTimeout(async () => {

    const current = session.get(jid);

    // Make sure this is still the same pending kickall
    if (current?.type !== "kickall") {
        return;
    }

    // Clear the session
    session.delete(jid);

    // Notify the group
    await sock.sendMessage(jid, {
        text: t(jid, "admin.kickall_expired")
    });

}, 30000);
        const warning = t(jid, "admin.kickall_confirm")
            .replace("{{count}}", members.length);

        await sock.sendMessage(jid, {
            text: warning
        });
    }
};
