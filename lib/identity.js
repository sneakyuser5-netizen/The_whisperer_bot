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
    return normalize(
        msg.key.participant ||
        msg.key.remoteJid ||
        ""
    );
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
    isOwner
};
