const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../database/warns.json");

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

function key(group, user) {
    return `${group}_${user}`;
}

function get(group, user) {
    const data = load();
    return data[key(group, user)]?.count || 0;
}

function add(group, user, jid) {
    const data = load();
    const k = key(group, user);

    if (!data[k]) {
        data[k] = {
            jid,
            count: 0
        };
    }

    data[k].count++;

    save(data);

    return data[k].count;
}

function reset(group, user) {
    const data = load();

    delete data[key(group, user)];

    save(data);
}

function list(group) {
    const data = load();

    const result = [];

    for (const k in data) {
        if (!k.startsWith(group + "_")) continue;

        result.push({
            user: k.split("_")[1],
            jid: data[k].jid,
            warns: data[k].count
        });
    }

    return result;
}

module.exports = {
    get,
    add,
    reset,
    list
};
