const fs = require("fs");
const path = require("path");
const dictionary = require("../language/dictionary");
const dictionaryFile = path.join(
    __dirname,
    "../language/dictionary.js"
);
const dictionaryContent =
    fs.readFileSync(dictionaryFile, "utf8");
const missingEntries = [];
const commandsDir = path.join(__dirname, "../commands");
const output = [];

function scan(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {

        const full = path.join(dir, file);

        if (fs.statSync(full).isDirectory()) {
            scan(full);
            continue;
        }

        if (!file.endsWith(".js")) continue;

        try {

            delete require.cache[
                require.resolve(full)
            ];

            const cmd = require(full);

            if (!cmd.name) continue;

            output.push({
                name: cmd.name,
                description:
                    cmd.description || ""
            });

        } catch (err) {

            console.log(
                "Skipped:",
                file
            );

        }

    }

}

scan(commandsDir);

output.sort((a, b) =>
    a.name.localeCompare(b.name)
);

const en = [
`module.exports = {
    menu_title: "📌 WhisperBot Menu",
    total_commands: "Total commands",
`
];

const fr = [
`module.exports = {
    menu_title: "📌 Menu WhisperBot",
    total_commands: "Nombre total de commandes",
`
];
en.push("module.exports = {\n");
fr.push("module.exports = {\n");
const missing = [];
for (const cmd of output) {

    const text =
        cmd.description
            .replace(/"/g, '\\"');
en.push(
`    "${cmd.name}": "${text.replace(/"/g, '\\"')}",\n`
);let french = dictionary[cmd.name];

if (!french) {

    missing.push(cmd.name);

    missingEntries.push(
`    ${cmd.name}:
        "",`
    );

    french = text;

}
fr.push(
`    "${cmd.name}": "${french.replace(/"/g, '\\"')}",\n`
);
}

en.push("};\n");
fr.push("};\n");
fs.writeFileSync(
    path.join(__dirname,
    "../language/en.js"),
    en.join("")
);

fs.writeFileSync(
    path.join(__dirname,
    "../language/fr.js"),
    fr.join("")
);
console.log(
`Done!

Commands found: ${output.length}

Created:

language/generated-en.js
language/generated-fr.js`
);
if (missing.length) {

    console.log("\nMissing French translations:\n");

    for (const name of missing) {
        console.log("-", name);
    }

    console.log(
        `\nTotal missing: ${missing.length}`
    );

}
if (missingEntries.length) {

    console.log(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
        "Paste these into language/dictionary.js:\n"
    );

    console.log(
        missingEntries.join("\n")
    );

    console.log(
        "\n━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

}

if (missingEntries.length) {

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Missing dictionary entries:\n");

    console.log(
        missingEntries.join("\n\n")
    );

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━");

}
