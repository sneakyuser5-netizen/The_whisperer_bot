module.exports = {
    name: "sync-test",
    description: "Test automatic source synchronization",
    execute: async ({ sock, msg }) => {
        await sock.sendMessage(msg.key.remoteJid, {
            text: "✅ Sync test works! This command came from the latest GitHub source."
        });
    }
};
