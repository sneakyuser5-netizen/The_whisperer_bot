const sharp = require("sharp");
const settings = require("./settings");
const { commands } = require("../handler");
const packageInfo = require("../package.json");

async function generateMenuImage(sock, msg, category = "admin", page = 1) {

    const jid = msg.key.remoteJid;
    const config = settings.get("global");

    const botName = config.bot_name || "Whisperer_Bot";
    const prefix = config.prefix || ".";

    const version = packageInfo.version || "1.0.0";

    const lang =
        config.language === "fr"
            ? "Français"
            : "English";

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
    // COMMANDS
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
    // PAGINATION
    // =========================

    const perPage = 12;

    const totalPages = Math.max(
        1,
        Math.ceil(categoryCommands.length / perPage)
    );

    page = parseInt(page) || 1;

    if (page < 1) page = 1;

    if (page > totalPages) {
        page = totalPages;
    }

    const start = (page - 1) * perPage;

    const pageCommands =
        categoryCommands.slice(
            start,
            start + perPage
        );

    // =========================
    // COMMAND ROWS
    // =========================

    let commandRows = "";

    pageCommands.forEach((command, index) => {

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

        description = String(description)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        // Keep descriptions short enough
        if (description.length > 70) {
            description =
                description.substring(0, 67) + "...";
        }

        const y = 540 + index * 72;

        commandRows += `
            <text
                x="85"
                y="${y}"
                class="command"
            >${prefix}${command.name}</text>

            <text
                x="85"
                y="${y + 28}"
                class="description"
            >${description}</text>
        `;
    });

    // =========================
    // IMAGE SIZE
    // =========================

    const height =
        620 + (pageCommands.length * 72);

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
            stop-color="#17334c"
        />

        <stop
            offset="100%"
            stop-color="#06101b"
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

<!-- BACKGROUND -->

<rect
    width="100%"
    height="100%"
    rx="35"
    fill="url(#background)"
/>

<!-- HEADER -->

<text
    x="450"
    y="65"
    text-anchor="middle"
    class="title"
>
    ADMIN COMMANDS
</text>

<text
    x="450"
    y="100"
    text-anchor="middle"
    class="subtitle"
>
    ${botName}
</text>

<line
    x1="70"
    y1="125"
    x2="830"
    y2="125"
    stroke="#3c6e91"
    stroke-width="2"
/>

<!-- INFORMATION CARD -->

<rect
    x="55"
    y="150"
    width="790"
    height="230"
    rx="25"
    fill="url(#card)"
    stroke="#315875"
    stroke-width="2"
/>

<text
    x="85"
    y="190"
    class="info"
>
    User: ${userName}
</text>

<text
    x="85"
    y="225"
    class="info"
>
    Language: ${lang}
</text>

<text
    x="85"
    y="260"
    class="info"
>
    Prefix: ${prefix}
</text>

<text
    x="85"
    y="295"
    class="info"
>
    Version: ${version}
</text>

<text
    x="85"
    y="330"
    class="info"
>
    Uptime: ${uptime}
</text>

<text
    x="85"
    y="365"
    class="info"
>
    RAM: ${ram} MB
</text>

<text
    x="520"
    y="190"
    class="info"
>
    Commands: ${categoryCommands.length}
</text>

<text
    x="520"
    y="225"
    class="info"
>
    Date: ${new Date().toLocaleDateString()}
</text>

<text
    x="520"
    y="260"
    class="info"
>
    Node: ${process.version}
</text>

<text
    x="520"
    y="295"
    class="info"
>
    Category: ${category}
</text>

<text
    x="520"
    y="330"
    class="info"
>
    Page: ${page}/${totalPages}
</text>

<!-- SECTION -->

<text
    x="450"
    y="430"
    text-anchor="middle"
    class="section"
>
    ADMIN COMMANDS
</text>

<text
    x="450"
    y="465"
    text-anchor="middle"
    class="page"
>
    Page ${page} of ${totalPages}
</text>

<!-- COMMANDS -->

${commandRows}

<!-- FOOTER -->

<line
    x1="70"
    y1="${height - 65}"
    x2="830"
    y2="${height - 65}"
    stroke="#315875"
    stroke-width="1"
/>

<text
    x="450"
    y="${height - 35}"
    text-anchor="middle"
    class="footer"
>
    ${prefix}menu admin ${page < totalPages ? "• Next: " + prefix + "menu admin " + (page + 1) : "• Last page"}
</text>

<style>

.title {
    fill: white;
    font-size: 34px;
    font-family: Arial, sans-serif;
    font-weight: bold;
}

.subtitle {
    fill: #78b7df;
    font-size: 18px;
    font-family: Arial, sans-serif;
}

.info {
    fill: #e8f3fa;
    font-size: 20px;
    font-family: Arial, sans-serif;
}

.section {
    fill: white;
    font-size: 26px;
    font-family: Arial, sans-serif;
    font-weight: bold;
}

.page {
    fill: #6fb5df;
    font-size: 17px;
    font-family: Arial, sans-serif;
}

.command {
    fill: #75c8ff;
    font-size: 23px;
    font-family: Arial, sans-serif;
    font-weight: bold;
}

.description {
    fill: #d3e2ec;
    font-size: 17px;
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
                `ADMIN MENU — ${botName}\n\n` +
                `${prefix}menu admin ${page}`
        });

    } catch (error) {

        console.error(
            "MENU IMAGE ERROR:",
            error
        );

        return sock.sendMessage(jid, {
            text:
                `ADMIN MENU — ${botName}\n\n` +
                pageCommands
                    .map(c => `${prefix}${c.name}`)
                    .join("\n")
        });
    }
}

module.exports = {
    generateMenuImage
};
