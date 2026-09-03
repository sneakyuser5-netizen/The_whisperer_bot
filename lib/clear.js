async function deleteMessages(sock, jid, messages) {

    let deleted = 0;

    for (const msg of messages) {

        try {

            await sock.sendMessage(jid, {
                delete: msg.key
            });

            deleted++;

        } catch (e) {}

    }

    return deleted;

}

async function clearCurrent100(sock, jid) {

    const cache = global.messageCache?.[jid] || [];

    const messages = cache.slice(-100);

    const deleted = await deleteMessages(
        sock,
        jid,
        messages
    );

    global.messageCache[jid] = [];

    return deleted;

}

async function clearCurrentAll(sock, jid) {

    const cache = global.messageCache?.[jid] || [];

    const deleted = await deleteMessages(
        sock,
        jid,
        cache
    );

    global.messageCache[jid] = [];

    return deleted;

}

async function clearPrivateChats(sock) {

    let total = 0;

    for (const jid of Object.keys(global.messageCache || {})) {

        if (jid.endsWith("@s.whatsapp.net")) {

            total += await clearCurrentAll(
                sock,
                jid
            );

        }

    }

    return total;

}

async function clearGroupChats(sock) {

    let total = 0;

    for (const jid of Object.keys(global.messageCache || {})) {

        if (jid.endsWith("@g.us")) {

            total += await clearCurrentAll(
                sock,
                jid
            );

        }

    }

    return total;

}

async function clearEverything(sock) {

    let total = 0;

    for (const jid of Object.keys(global.messageCache || {})) {

        total += await clearCurrentAll(
            sock,
            jid
        );

    }

    return total;

}

module.exports = {
    clearCurrent100,
    clearCurrentAll,
    clearPrivateChats,
    clearGroupChats,
    clearEverything
};
