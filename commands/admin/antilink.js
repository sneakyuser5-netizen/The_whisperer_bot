const settings = require("../../lib/settings");


module.exports = {

    name: "antilink",

    description: "Enable or disable anti-link",

    category: "admin",

    permission: "admin",

    usage: ".antilink on/off",

    minArgs: 1,


    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;


        if (!jid.endsWith("@g.us")) {
            return sock.sendMessage(jid, {
                text: "❌ This command only works in groups."
            });
        }


        const option = args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return sock.sendMessage(jid, {
                text: "❌ Use:\n.antilink on\n.antilink off"
            });

        }


        settings.set(
    jid,
    "antilink",
    option === "on"
);


        await sock.sendMessage(jid, {
            text:
            option === "on"
            ? "✅ Anti-link enabled for this group."
            : "✅ Anti-link disabled for this group."
        });

    }

};
