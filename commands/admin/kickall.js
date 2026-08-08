const { t } = require("../../lib/lang");

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

        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

const me = metadata.participants.find(
    p => p.id === botId
);

if (!me?.admin) {
    return sock.sendMessage(jid, {
        text: t(jid, "admin.need_owner_rights")
    });
}

const myNumber = sock.user.id.split("@")[0].split(":")[0];

const members = metadata.participants.filter(p => {
    const number = p.id.split("@")[0].split(":")[0];

    return !p.admin && number !== myNumber;
});

        if (!members.length) {
            return sock.sendMessage(jid, {
                text: t(jid, "admin.kickall_none")
            });
        }

        let kicked = 0;

        for (const member of members) {
            try {
                await sock.groupParticipantsUpdate(
                    jid,
                    [member.id],
                    "remove"
                );
                kicked++;
            } catch (err) {

    console.dir(err, { depth: null });

    failed++;

}
        }

        await sock.sendMessage(jid, {
            text: t(jid, "admin.kickall_done")
                .replace("{{count}}", kicked)
        });

    }
};
