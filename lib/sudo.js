const fs = require("fs");

const file = "./database/sudo.json";

function load() {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "{}");
    }

    return JSON.parse(fs.readFileSync(file));
}

function save(data) {
    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );
}

function add(id) {
    const data = load();
    data[id] = true;
    save(data);
}

function remove(id) {
    const data = load();
    delete data[id];
    save(data);
}

function has(id) {
    const data = load();
    return data[id] === true;
}

function all() {
    return Object.keys(load());
}

module.exports = {
    add,
    remove,
    has,
    all
};
