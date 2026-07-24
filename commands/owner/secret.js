module.exports = {
    name: "secret",

    description: "Owner only test command",

    category: "owner",

    permission: "owner",

    execute: async (sock, msg) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: t("owner.secret_success")
            }
        );

    }
};
