const fs = require("fs");
const path = require("path");

function loadPlugins() {
    const plugins = new Map();
    const files = fs.readdirSync(path.join(__dirname, "../plugins"));

    for (const file of files) {
        const plugin = require(`../plugins/${file}`);

        plugins.set(plugin.name, plugin);

        if (plugin.alias && plugin.alias.length > 0) {
            plugin.alias.forEach(a => plugins.set(a, plugin));
        }
    }

    return plugins;
}

module.exports = { loadPlugins };
