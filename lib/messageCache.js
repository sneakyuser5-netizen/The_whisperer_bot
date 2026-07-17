const cache = new Map();

const MAX_MESSAGES = 1000;

function save(msg) {
    if (!msg?.key?.id) return;

    cache.set(msg.key.id, msg);

    if (cache.size > MAX_MESSAGES) {
        const first = cache.keys().next().value;
        cache.delete(first);
    }
}

function get(id) {
    return cache.get(id);
}

function remove(id) {
    cache.delete(id);
}

module.exports = {
    save,
    get,
    remove
};
