const fs = require("fs");
const identity = require("./identity");

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

    user = identity.normalize(user);

    const data = load();

    if (!data[group]) {
        data[group] = {};
    }

    if (
    !data[group][user] ||
    typeof data[group][user] !== "object"
) {
    data[group][user] = {
        last: Date.now(),
        messages: 0
    };
    }
    data[group][user] = {
        last: Date.now(),
        messages: 0
    };
}

data[group][user].last = Date.now();
data[group][user].messages++;

    save(data);



function get(group, user) {

    user = identity.normalize(user);

    const data = load();

    return data[group]?.[user]?.last || 0;

}
function getGroup(group) {

    const data = load();

    return data[group] || {};

}
function format(ms) {

    const sec = Math.floor(ms / 1000);

    const d = Math.floor(sec / 86400);

    const h = Math.floor((sec % 86400) / 3600);

    const m = Math.floor((sec % 3600) / 60);

    const s = sec % 60;

    if (d > 0) {
        return `${d}d ${h}h ${m}m`;
    }

    if (h > 0) {
        return `${h}h ${m}m`;
    }

    if (m > 0) {
        return `${m}m ${s}s`;
    }

    return `${s}s`;

}
function leaderboard(group) {

    const data = getGroup(group);

    return Object.entries(data)
        .sort((a, b) => b[1].messages - a[1].messages);

}

module.exports = {
    update,
    get,
    getGroup,
    format,
    leaderboard
};
