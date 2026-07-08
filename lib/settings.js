const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../database/settings.json");

function load() {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch {
        return {};
    }
}

function save(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function get(group) {
    const data = load();
    return data[group] || {};
}

function set(group, key, value) {
    const data = load();

    if (!data[group]) {
        data[group] = {};
    }

    data[group][key] = value;

    save(data);
}

module.exports = {
    get,
    set
};
