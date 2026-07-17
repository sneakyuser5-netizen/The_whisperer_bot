const fs = require("fs");

const FILE = "./database/edited.json";

function load() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }

    return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function set(id, message) {
    const data = load();
    data[id] = message;
    save(data);
}

function get(id) {
    return load()[id];
}

function remove(id) {
    const data = load();
    delete data[id];
    save(data);
}

module.exports = {
    set,
    get,
    remove
};
