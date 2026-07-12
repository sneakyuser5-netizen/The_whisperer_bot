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

function set(number) {

    save({
        botOwner: number,
        welcomed: false
    });

}

function get() {

    const data = load();

    return {
        botOwner: data.botOwner || "",
        welcomed: data.welcomed || false
    };

}
function welcomed() {

    const data = load();

    data.welcomed = true;

    save(data);

}

module.exports = {
    get,
    set,
    welcomed
};
