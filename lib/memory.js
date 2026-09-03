const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "../.whisperer-memory");
const FILE = path.join(DIR, "memories.json");

const MAX_MEMORIES = 100;
const MAX_MEMORY_LENGTH = 500;

function ensureStore() {
    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR, { recursive: true });
    }

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "{}");
    }
}

function load() {
    ensureStore();

    try {
        const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

        if (!data || typeof data !== "object") {
            return {};
        }

        return data;
    } catch (err) {
        console.error("MEMORY LOAD ERROR:", err);
        return {};
    }
}

function save(data) {
    ensureStore();

    const temp = `${FILE}.tmp`;

    fs.writeFileSync(
        temp,
        JSON.stringify(data, null, 2),
        "utf8"
    );

    fs.renameSync(temp, FILE);
}

function get(jid) {
    const data = load();

    if (!Array.isArray(data[jid])) {
        return [];
    }

    return data[jid];
}

function add(jid, memory) {
    if (!jid || !memory) return false;

    memory = String(memory).trim();

    if (!memory || memory.length > MAX_MEMORY_LENGTH) {
        return false;
    }

    const data = load();

    if (!Array.isArray(data[jid])) {
        data[jid] = [];
    }

    const exists = data[jid].some(
        item =>
            item.text.toLowerCase() === memory.toLowerCase()
    );

    if (exists) {
        return false;
    }

    data[jid].push({
        id: Date.now().toString(36),
        text: memory,
        createdAt: new Date().toISOString()
    });

    if (data[jid].length > MAX_MEMORIES) {
        data[jid] = data[jid].slice(-MAX_MEMORIES);
    }

    save(data);

    return true;
}

function remove(jid, query) {
    const data = load();

    if (!Array.isArray(data[jid])) {
        return false;
    }

    const before = data[jid].length;

    const search = String(query)
        .trim()
        .toLowerCase();

    data[jid] = data[jid].filter(
        item =>
            !item.text.toLowerCase().includes(search)
    );

    if (data[jid].length !== before) {
        save(data);
        return true;
    }

    return false;
}

function clear(jid) {
    const data = load();

    if (!data[jid]) {
        return false;
    }

    delete data[jid];

    save(data);

    return true;
}

function search(jid, query, limit = 10) {
    const memories = get(jid);

    if (!memories.length) {
        return [];
    }

    const words = String(query)
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length >= 3);

    if (!words.length) {
        return memories.slice(-limit);
    }

    const scored = memories.map(memory => {
        const text = memory.text.toLowerCase();

        let score = 0;

        for (const word of words) {
            if (text.includes(word)) {
                score++;
            }
        }

        return {
            memory,
            score
        };
    });

    return scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.memory);
}

module.exports = {
    get,
    add,
    remove,
    clear,
    search
};
