const fs = require("fs");

const FILE = "./database/activity.json";

function load() {

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }

    return JSON.parse(fs.readFileSync(FILE));

}

function save(data) {

    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    );

}

function update(group, user) {

    console.log("ACTIVITY:", group, user);

    const data = load();

    if (!data[group]) {
        data[group] = {};
    }

    data[group][user] = Date.now();

    save(data);

    console.log(data);

}

function get(group, user) {

    const data = load();

    return data[group]?.[user] || 0;

}

module.exports = {
    update,
    get
};
