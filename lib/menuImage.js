const sharp = require("sharp");
const settings = require("./settings");
const { commands } = require("../handler");
const packageInfo = require("../package.json");

async function generateMenuImage(sock, msg, category = "admin") {

    const jid = msg.key.remoteJid;
    const config = settings.get("global");

    const botName = config.bot_name || "Whisperer_Bot";
    const prefix = config.prefix || ".";
    const version = packageInfo.version || "1.0.0";

    const lang =
        config.language === "fr"
            ? "Français 🇫🇷"
            : "English 🇬🇧";

    const userName =
        msg.pushName || "User";

    // =========================
    // UPTIME
    // =========================

    const seconds = Math.floor(
        (Date.now() - (global.START_TIME || Date.now())) / 1000
    );

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const uptime = `${hours}h ${minutes}m ${secs}s`;

    // =========================
    // RAM
    // =========================

    const ram = (
        process.memoryUsage().rss /
        1024 /
        1024
    ).toFixed(1);

    // =========================
    // GET COMMANDS
    // =========================

    const uniqueCommands = [
        ...new Set(commands.values())
    ];

    const categoryCommands = uniqueCommands.filter(
        command =>
            (command.category || "other").toLowerCase() ===
            category.toLowerCase()
    );

    // =========================
    // TRANSLATIONS
    // =========================

    const dictionary =
        require("../language/source/dictionary");

    const commandFr =
        require("../language/source/command-fr");

    // =========================
    // COMMAND LIST
    // =========================

    let commandRows = "";

    categoryCommands.forEach((command, index) => {

        let description =
            config.language === "fr"
                ? (
                    commandFr[command.name] ||
                    dictionary[command.name] ||
                    command.description ||
                    ""
                )
                : (
                    dictionary[command.name] ||
                    command.description ||
                    ""
                );

        // Remove characters that could break SVG
        description = String(description)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        const y = 590 + index * 65;

        commandRows += `
            <text
                x="90"
                y="${y}"
                class="command"
            >
                🛡️ ${prefix}${command.name}
            </text>

            <text
                x="90"
                y="${y + 28}"
                class="description"
            >
                ${description.substring(0, 75)}
            </text>
        `;
    });

    // =========================
    // IMAGE HEIGHT
    // =========================

    const baseHeight = 560;
    const commandHeight = categoryCommands.length * 65;

    const height =
        Math.max(
            baseHeight + commandHeight + 80,
            700
        );

    // =========================
    // SVG
    // =========================

    const svg = `
<svg
    width="900"
    height="${height}"
    xmlns="http://www.w3.org/2000/svg"
>

    <defs>

        <linearGradient
            id="background"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
        >

            <stop
                offset="0%"
                stop-color="#07111f"
            />

            <stop
                offset="50%"
                stop-color="#172f46"
            />

            <stop
                offset="100%"
                stop-color="#06101c"
            />

        </linearGradient>

        <linearGradient
            id="card"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
        >

            <stop
                offset="0%"
                stop-color="#173b58"
            />

            <stop
                offset="100%"
                stop-color="#0b1d30"
            />

        </linearGradient>

    </defs>

    <!-- Background -->

    <rect
        width="100%"
        height="100%"
        rx="35"
        fill="url(#background)"
    />

    <!-- Header -->

    <text
        x="450"
        y="70"
        text-anchor="middle"
        class="title"
    >
        🛡️ ADMIN COMMANDS
    </text>

    <text
        x="450"
        y="108"
        text-anchor="middle"
        class="subtitle"
    >
        ${botName}
    </text>

    <line
        x1="70"
        y1="135"
        x2="830"
        y2="135"
        stroke="#3c6e91"
        stroke-width="2"
    />

    <!-- Bot information -->

    <rect
        x="60"
        y="160"
        width="780"
        height="260"
        rx="25"
        fill="url(#card)"
        stroke="#315875"
        stroke-width="2"
    />

    <text
        x="90"
        y="200"
        class="info"
    >
        👤 User: ${userName}
    </text>

    <text
        x="90"
        y="240"
        class="info"
    >
        🌍 Language: ${lang}
    </text>

    <text
        x="90"
        y="280"
        class="info"
    >
        ⚡ Prefix: ${prefix}
    </text>

    <text
        x="90"
        y="320"
        class="info"
    >
        📦 Version: ${version}
    </text>

    <text
        x="90"
        y="360"
        class="info"
    >
        ⏱ Uptime: ${uptime}
    </text>

    <text
        x="90"
        y="400"
        class="info"
    >
        💾 RAM: ${ram} MB
    </text>

    <text
        x="520"
        y="200"
        class="info"
    >
        🛡️ Commands: ${categoryCommands.length}
    </text>

    <text
        x="520"
        y="240"
        class="info"
    >
        📅 ${new Date().toLocaleDateString()}
    </text>

    <text
        x="520"
        y="280"
        class="info"
    >
        💻 Node: ${process.version}
    </text>

    <!-- Commands title -->

    <text
        x="450"
        y="480"
        text-anchor="middle"
        class="section"
    >
        👮 ADMIN COMMANDS
    </text>

    ${commandRows}

    <!-- Footer -->

    <text
        x="450"
        y="${height - 30}"
        text-anchor="middle"
        class="footer"
    >
        ${prefix}menu admin • ${botName}
    </text>

    <style>

        .title {
            fill: white;
            font-size: 36px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .subtitle {
            fill: #78b7df;
            font-size: 19px;
            font-family: Arial, sans-serif;
        }

        .info {
            fill: #e8f3fa;
            font-size: 21px;
            font-family: Arial, sans-serif;
        }

        .section {
            fill: white;
            font-size: 25px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .command {
            fill: #75c8ff;
            font-size: 21px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .description {
            fill: #d3e2ec;
            font-size: 16px;
            font-family: Arial, sans-serif;
        }

        .footer {
            fill: #7197b2;
            font-size: 16px;
            font-family: Arial, sans-serif;
        }

    </style>

</svg>
`;

    try {

        const image = await sharp(
            Buffer.from(svg)
        )
        .png()
        .toBuffer();

        return await sock.sendMessage(jid, {
            image,
            caption:
                `🛡️ *${botName} — ADMIN MENU*\n\n` +
                `${prefix}menu admin`
        });

    } catch (error) {

        console.error(
            "MENU IMAGE ERROR:",
            error
        );

        return sock.sendMessage(jid, {
            text:
                `🛡️ *${botName} — ADMIN MENU*\n\n` +
                `${categoryCommands
                    .map(c => `${prefix}${c.name}`)
                    .join("\n")}`
        });
    }
}

module.exports = {
    generateMenuImage
};
