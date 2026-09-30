const config = require("../config");
const ownerDB = require("./owner");
const sudo = require("./sudo");

function normalize(id = "") {
    return String(id)
        .trim()
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace(/:\d+/, "")
        .trim();
}

function getSender(msg) {
    const id = msg.key?.fromMe
        ? (
            msg.key?.remoteJidAlt ||
            msg.key?.participant ||
            msg.key?.remoteJid ||
            ""
        )
        : (
            msg.key?.participant ||
            msg.key?.remoteJidAlt ||
            msg.key?.remoteJid ||
            ""
        );

    if (
        global.sock &&
        global.sock.signalRepository &&
        typeof global.sock.signalRepository.lidMapping?.getPhoneNumber === "function"
    ) {
        try {
            const phone =
                global.sock
                    .signalRepository
                    .lidMapping
                    .getPhoneNumber(id);

            if (phone) {
                return normalize(phone);
            }
        } catch {}
    }

    return normalize(id);
}

function debug() {}

function getCreator() {
    return normalize(
        String(config.CREATOR || "").trim()
    );
}

function getBotOwner() {

    const data = ownerDB.get();

    if (!data) {
        return "";
    }

    return normalize(data.botOwner);

}

function isCreator(msg) {
    return getSender(msg) === getCreator();
}

function isBotOwner(msg) {
    return getSender(msg) === getBotOwner();
}

function isSudo(msg) {

    return sudo.has(
        getBotOwner(),
        getSender(msg)
    );

}

function isOwner(msg) {
    // Bot Owner is determined by owner.json.
    // Creator is also allowed through the owner-level gate.
    // fromMe is retained for commands sent from the bot's own WhatsApp account.
    return (
        isBotOwner(msg) ||
        isCreator(msg) ||
        msg.key?.fromMe === true
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
