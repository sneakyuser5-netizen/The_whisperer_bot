module.exports = {

    name: "admincheck",

    description: "Test admin permission",

    category: "admin",

    permission: "admin",

    execute: async (sock, msg) => {

        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: "👥 Admin access confirmed!"
            }
        );

    }
};