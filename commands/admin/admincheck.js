module.exports = {

    name: "admincheck",

    description: "Test admin permission",

    category: "admin",

    permission: "all",

    execute: async (sock, msg) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: "👥 Admin access confirmed!"
            }
        );

    }
};
