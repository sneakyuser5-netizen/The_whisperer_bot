const fs = require("fs");
const path = require("path");

const file = path.join(
    __dirname,
    "../database/mutes.json"
);

function load() {
    try {
        return JSON.parse(
            fs.readFileSync(file)
        );
    } catch {
        return {};
    }
}

function save(data) {
    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );
}

function mute(group, user, time) {

    const data = load();

    if (!data[group]) {
        data[group] = {};
    }

    data[group][user] = {
        until: Date.now() + time
    };

    save(data);
}


function unmute(group, user) {

    const data = load();

    if (!data[group] || !data[group][user]) {
        return false;
    }

    delete data[group][user];

    save(data);

    return true;

}

function isMuted(group, user) {

    const data = load();

    const entry =
        data[group]?.[user];

    if (!entry) return false;

    if (Date.now() > entry.until) {

        delete data[group][user];
        save(data);

        return false;
    }

    return true;
}


function list(group) {

    return load()[group] || {};
}


module.exports = {
    mute,
    unmute,
    isMuted,
    list
};
