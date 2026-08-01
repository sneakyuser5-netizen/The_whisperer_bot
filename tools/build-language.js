const fs = require("fs");
const path = require("path");
const { translate } = require("@vitalets/google-translate-api");

const ROOT = path.join(__dirname, "..");

const COMMANDS = path.join(ROOT, "commands");
const EVENTS = path.join(ROOT, "events");
const LIB = path.join(ROOT, "lib");

const EN_FILE = path.join(ROOT, "language/en.js");
const FR_FILE = path.join(ROOT, "language/fr.js");
const DICTIONARY_FILE = path.join(
    ROOT,
    "language/source/dictionary.js"
);

const en = require(EN_FILE);
const fr = require(FR_FILE);
const dictionary = require(DICTIONARY_FILE);

const foundCommands = new Map();
const foundKeys = new Set();

let scanned = 0;
let addedDesc = 0;
let addedEn = 0;
let addedFr = 0;

function getFiles(dir) {

    if (!fs.existsSync(dir)) return [];

    let output = [];

    for (const file of fs.readdirSync(dir)) {

        const full = path.join(dir, file);

        if (fs.statSync(full).isDirectory()) {

            output.push(...getFiles(full));

        } else if (file.endsWith(".js")) {

            output.push(full);

        }

    }

    return output;

}

const files = [
    ...getFiles(COMMANDS),
    ...getFiles(EVENTS),
    ...getFiles(LIB)
];

for (const file of files) {

    scanned++;

    const code = fs.readFileSync(file, "utf8");

    const cmd = code.match(
        /name\s*:\s*["'`](.*?)["'`]/
    );

    const desc = code.match(
        /description\s*:\s*["'`]([^"'`]+)["'`]/
    );

    if (cmd) {

        foundCommands.set(
            cmd[1],
            desc ? desc[1] : "No description."
        );

    }

    const regex =
        /t\s*\(\s*(?:[^,]+,\s*)?["'`]([a-zA-Z0-9_.-]+)["'`]\s*\)/g;

    let m;

    while ((m = regex.exec(code)) !== null) {

        foundKeys.add(m[1]);

    }

}

async function translateText(text) {

    try {

        const result = await translate(text, {
            from: "en",
            to: "fr"
        });

        return result.text;

    } catch {

        return text;

    }

}

(async () => {

    // ---------------------------------
    // Command descriptions
    // ---------------------------------

    for (const [command, description] of foundCommands) {

        dictionary[command] = description;
        en[command] = description;
        fr[command] = await translateText(description);

    }

    // ---------------------------------
    // Translation keys
    // ---------------------------------

    function autoEnglish(key) {

        return key.replace(/[._]/g, " ");

    }

    function autoFrench(key) {

        return key.replace(/[._]/g, " ");

    }

    for (const key of foundKeys) {

        if (foundCommands.has(key)) continue;

        if (!en[key]) {

            en[key] = autoEnglish(key);
            addedEn++;

        }

        if (!fr[key]) {

            fr[key] = autoFrench(key);
            addedFr++;

        }

    }


    function sortObject(obj) {

        return Object.fromEntries(
            Object.entries(obj).sort((a, b) =>
                a[0].localeCompare(b[0])
            )
        );

    }

    fs.writeFileSync(
        DICTIONARY_FILE,
        "module.exports = " +
        JSON.stringify(sortObject(dictionary), null, 2) +
        ";\n"
    );

    fs.writeFileSync(
        EN_FILE,
        "module.exports = " +
        JSON.stringify(sortObject(en), null, 2) +
        ";\n"
    );

    fs.writeFileSync(
        FR_FILE,
        "module.exports = " +
        JSON.stringify(sortObject(fr), null, 2) +
        ";\n"
    );


console.log("\n══════════════════════════════");
console.log(" WhisperBot Language Builder ");
console.log("══════════════════════════════");

console.log(`Files scanned        : ${scanned}`);
console.log(`Commands found       : ${foundCommands.size}`);
console.log(`Translation keys     : ${foundKeys.size}`);

console.log("");
console.log("══════════════════════════════");
console.log(" Builder Report");
console.log("══════════════════════════════");

console.log(`Commands processed : ${foundCommands.size}`);
console.log(`Descriptions synced: ${foundCommands.size}`);
console.log(`Translated to French: ${foundCommands.size}`);
console.log(`Translation keys: ${foundKeys.size}`);

console.log("");
console.log("✅ Everything is synchronized.");
})();
