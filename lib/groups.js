async function metadata(sock, group) {

    return await sock.groupMetadata(group);

}


async function members(sock, group) {

    const data = await metadata(sock, group);

    return data.participants;

}


async function setOpen(sock, group) {

    return await sock.groupSettingUpdate(
        group,
        "not_announcement"
    );

}


async function setClose(sock, group) {

    return await sock.groupSettingUpdate(
        group,
        "announcement"
    );

}


async function remove(sock, group, user) {

    return await sock.groupParticipantsUpdate(
        group,
        [user],
        "remove"
    );

}


async function promote(sock, group, user) {

    return await sock.groupParticipantsUpdate(
        group,
        [user],
        "promote"
    );

}


async function demote(sock, group, user) {

    return await sock.groupParticipantsUpdate(
        group,
        [user],
        "demote"
    );

}


module.exports = {
    metadata,
    members,
    setOpen,
    setClose,
    remove,
    promote,
    demote
};
