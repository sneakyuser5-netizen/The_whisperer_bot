const { t } = require("../../lib/lang");
const settings = require("../../lib/settings");

module.exports = {
    name: "tag",
    description: "Enable or disable owner mention audio response",
    category: "owner",
    permission: "owner",
    usage: ".tag on | .tag off",

    execute: async (sock, msg, args = []) => {
        const jid = msg.key.remoteJid;
        const action = (args[0] || "").toLowerCase();

        if (!["on", "off"].includes(action)) {
            return sock.sendMessage(jid, {
                text: t(jid, "owner.tag_usage")
            });
        }

        const enabled = action === "on";

        settings.set(
            "global",
            "ownerTagAudio",
            enabled
        );

        return sock.sendMessage(jid, {
            text: enabled
                ? t(jid, "owner.tag_on")
                : t(jid, "owner.tag_off")
        });
    }
};
