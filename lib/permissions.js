const config = require("../config");


function isOwner(user) {

    return user.includes(config.OWNER);

}


async function isAdmin(sock, group, user) {

    const metadata = await sock.groupMetadata(group);

    const participant = metadata.participants.find(
        p => p.id === user
    );

    if (!participant) return false;

    return (
        participant.admin === "admin" ||
        participant.admin === "superadmin"
    );

}


async function isBotAdmin(sock, group) {

    const metadata = await sock.groupMetadata(group);

    const bot = metadata.participants.find(
        p => p.id.includes(sock.user.id.split(":")[0])
    );

    if (!bot) return false;

    return (
        bot.admin === "admin" ||
        bot.admin === "superadmin"
    );

}


module.exports = {
    isOwner,
    isAdmin,
    isBotAdmin
};
