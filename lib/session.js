const sessions = new Map();

module.exports = {

    set(id, data) {
        sessions.set(id, data);
    },

    get(id) {
        return sessions.get(id);
    },

    has(id) {
        return sessions.has(id);
    },

    delete(id) {
        sessions.delete(id);
    }

};
