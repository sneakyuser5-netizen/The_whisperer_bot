const fs = require("fs");

const file = "./database/setup.json";

function load() {

    if (!fs.existsSync(file)) {

        fs.writeFileSync(
            file,
            JSON.stringify({
                phone: ""
            }, null, 2)
        );

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

function getPhone() {

    return load().phone || "";

}

function setPhone(number) {

    const data = load();

    data.phone = number;

    save(data);

}

function clearPhone() {

    const data = load();

    data.phone = "";

    save(data);

}

module.exports = {

    getPhone,
    setPhone,
    clearPhone

};
