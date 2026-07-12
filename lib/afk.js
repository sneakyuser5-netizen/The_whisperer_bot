const fs = require("fs");

const FILE = "./database/afk.json";

function load() {

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }

    return JSON.parse(
        fs.readFileSync(FILE)
    );

}

function save(data) {

    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    );

}

function set(user, reason) {

    const data = load();

    data[user] = {

        reason,

        time: Date.now()

    };

    save(data);

}

function get(user) {

    return load()[user];

}

function remove(user) {

    const data = load();

    delete data[user];

    save(data);

}

function has(user) {

    return !!load()[user];

}

function format(ms) {

    const sec = Math.floor(ms / 1000);

    const h = Math.floor(sec / 3600);

    const m = Math.floor((sec % 3600) / 60);

    const s = sec % 60;

    return `${h}h ${m}m ${s}s`;

}

module.exports = {

    set,

    get,

    remove,

    has,

    format

};
