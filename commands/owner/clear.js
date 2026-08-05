const session = require("../../lib/session");
const { t } = require("../../lib/lang");

module.exports = {
    name: "clear",
    description: "Clear chats",
    category: "owner",
    permission: "owner",
    usage: ".clear",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

const text = `
${t(jid, "owner.clear_title")}

${t(jid, "owner.clear_choose")}

1️⃣ ${t(jid, "owner.clear_current")}

2️⃣ ${t(jid, "owner.clear_private")}

3️⃣ ${t(jid, "owner.clear_groups")}

4️⃣ ${t(jid, "owner.clear_all")}

❌ 0 - ${t(jid, "owner.clear_cancel")}
`;
session.set(jid, {
    type: "clear"
});
        console.log("CLEAR SESSION:", 
                    session.get(jid));

        await sock.sendMessage(
            jid,
            {
                text
            },
            {
                quoted: msg
            }
        );

    }

};
