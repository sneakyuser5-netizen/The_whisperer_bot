const fs = require("fs");

const file = "./database/status.json";


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


function set(user, value) {

    const data = load();

    data[user] = value;

    save(data);

}


function get(user) {

    const data = load();

    return data[user] || false;

}


module.exports = {
    set,
    get
};
