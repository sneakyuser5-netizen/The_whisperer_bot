const config = require("../config");
const ownerDB = require("./owner");
const sudo = require("./sudo");

function normalize(id = "") {
    return id
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace(/:\d+/, "");
}

function getSender(msg) {

    const id =
        msg.key.participant ||
        msg.key.remoteJid ||
        "";

    if (
        global.sock &&
        global.sock.signalRepository &&
        typeof global.sock.signalRepository.lidMapping?.getPhoneNumber === "function"
    ) {

        try {

            const phone =
                global.sock.signalRepository
                .lidMapping
                .getPhoneNumber(id);

            if (phone) {

                return normalize(phone);

            }

        } catch {}

    }

    return normalize(id);

}
function debug(msg) {

    console.log("RAW:", msg.key.participant || msg.key.remoteJid);

    console.log("NORMALIZED:", getSender(msg));

    }

function getCreator() {
    return normalize(config.OWNER);
}

function getBotOwner() {
    return normalize(ownerDB.get() || "");
}

function isCreator(msg) {
    return getSender(msg) === getCreator();
}

function isBotOwner(msg) {
    return getSender(msg) === getBotOwner();
}

function isSudo(msg) {
    return sudo.has(getSender(msg));
}

function isOwner(msg) {
    return (
        isCreator(msg) ||
        isBotOwner(msg) ||
        msg.key.fromMe
    );
}

module.exports = {
    normalize,
    getSender,
    getCreator,
    getBotOwner,
    isCreator,
    isBotOwner,
    isSudo,
    isOwner,
    debug
};
