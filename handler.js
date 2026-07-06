const { loadPlugins } = require("../core/pluginManager");

const plugins = loadPlugins();

async function handleMessage(sock, msg) {
    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text;

    if (!text) return;

    const jid = msg.key.remoteJid;
    const args = text.trim().split(" ");
    const cmd = args[0].toLowerCase().replace(".", "");
    const params = args.slice(1);

    const plugin = plugins.get(cmd);

    if (plugin) {
        await plugin.execute(sock, msg, params, [...plugins.values()]);
    }
}

module.exports = { handleMessage };
