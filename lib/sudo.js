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

function add(owner, user) {

    const data = load();

    if (!data[owner]) {

        data[owner] = {};

    }

    data[owner][user] = true;

    save(data);

}

function remove(owner, user) {

    const data = load();

    if (!data[owner]) return;

    delete data[owner][user];

    save(data);

}

function has(owner, user) {

    const data = load();

    return !!data[owner]?.[user];

}

function all(owner) {

    const data = load();

    return Object.keys(
        data[owner] || {}
    );

}

module.exports = {
    add,
    remove,
    has,
    all
};
