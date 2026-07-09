const fs = require("fs");

const file = "./database/sudo.json";


function load() {

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "{}");
    }

    return JSON.parse(
        fs.readFileSync(file)
    );

}


function save(data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );

}


function add(user) {

    const data = load();

    data[user] = true;

    save(data);

}


function remove(user) {

    const data = load();

    delete data[user];

    save(data);

}


function has(user) {

    const data = load();

    return !!data[user];

}


module.exports = {
    add,
    remove,
    has
};
