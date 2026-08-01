const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../database/autowelcome.json");

function load() {

    if (!fs.existsSync(FILE)) {

        fs.writeFileSync(FILE, JSON.stringify({
            message: "",
            sent: {}
        }, null, 2));

    }

    return JSON.parse(fs.readFileSync(FILE));

}

function save(data) {

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

}

function getMessage() {

    return load().message;

}

function setMessage(message) {

    const data = load();

    data.message = message;

    save(data);

}

function clearMessage() {

    const data = load();

    data.message = "";

    save(data);

}

function alreadySent(jid) {

    return !!load().sent[jid];

}

function markSent(jid) {

    const data = load();

    data.sent[jid] = true;

    save(data);

}

module.exports = {

    getMessage,

    setMessage,

    clearMessage,

    alreadySent,

    markSent

};
