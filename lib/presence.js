const identity = require("./identity");

const online = new Map();

function set(user) {

    user = identity.normalize(user);

    online.set(user, Date.now());

}

function has(user) {

    user = identity.normalize(user);

    const time = online.get(user);

    if (!time) return false;

    return Date.now() - time < 5 * 60 * 1000;

}

module.exports = {
    set,
    has
};
