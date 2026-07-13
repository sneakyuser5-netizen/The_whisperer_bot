const fs = require("fs");
const path = require("path");

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

const en = [];
const fr = [];

en.push("module.exports = {\n");
fr.push("module.exports = {\n");

for (const cmd of output) {

    const text =
        cmd.description
            .replace(/"/g, '\\"');

    en.push(
`    ${cmd.name}: "${text}",\n`
    );

    fr.push(
`    ${cmd.name}: "${text}",\n`
    );

}

en.push("};\n");
fr.push("};\n");

fs.writeFileSync(
    path.join(__dirname,
    "../language/generated-en.js"),
    en.join("")
);

fs.writeFileSync(
    path.join(__dirname,
    "../language/generated-fr.js"),
    fr.join("")
);

console.log(
`Done!

Commands found: ${output.length}

Created:

language/generated-en.js
language/generated-fr.js`
);
