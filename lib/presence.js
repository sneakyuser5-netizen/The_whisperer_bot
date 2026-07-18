const online = new Map();

function set(user) {
    online.set(user, Date.now());
}

function has(user) {
    const time = online.get(user);

    if (!time) return false;

    // Consider online for 5 minutes
    return Date.now() - time < 5 * 60 * 1000;
}

module.exports = {
    set,
    has
};
