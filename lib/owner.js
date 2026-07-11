const fs = require("fs");

const file = "./database/owner.json";

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

function set(owner) {
    const data = load();

    data.owner = owner;

    save(data);
}

function get() {
    const data = load();

    return data.owner || null;
}

module.exports = {
    set,
    get
};
