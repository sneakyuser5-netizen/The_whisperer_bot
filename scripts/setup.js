const {
    execFileSync,
    spawnSync
} = require("child_process");

const fs = require("fs");
const os = require("os");
const path = require("path");

const platform = os.platform();
const arch = os.arch();
const rootDir = process.cwd();

function commandExists(command, args = ["--version"]) {
    try {
        execFileSync(command, args, {
            stdio: "ignore"
        });
        return true;
    } catch {
        return false;
    }
}

function run(command, args, options = {}) {
    console.log(`\n▶ ${command} ${args.join(" ")}`);

    const result = spawnSync(command, args, {
        stdio: "inherit",
        ...options
    });

    return result.status === 0;
}

function runCapture(command, args) {
    try {
        return execFileSync(command, args, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
        }).trim();
    } catch {
        return "";
    }
}

function isTermux() {
    return (
        platform === "android" ||
        !!process.env.TERMUX_VERSION ||
        !!process.env.PREFIX?.includes("com.termux")
    );
}

function isLinux() {
    return platform === "linux";
}

function canUseSudo() {
    return commandExists("sudo", ["--version"]);
}

function canUseApt() {
    return commandExists("apt-get", ["--version"]);
}

function canUseApk() {
    return commandExists("apk", ["--version"]);
}

function canUseDnf() {
    return commandExists("dnf", ["--version"]);
}

function canUseYum() {
    return commandExists("yum", ["--version"]);
}

function canUsePacman() {
    return commandExists("pacman", ["--version"]);
}

function installSystemPackage(packageName) {
    /*
     * ======================================================
     * TERMUX
     * ======================================================
     */

    if (isTermux() && commandExists("pkg", ["--help"])) {
        console.log(
            `📱 Termux detected. Installing ${packageName}...`
        );

        return run("pkg", [
            "install",
            "-y",
            packageName
        ]);
    }

    /*
     * ======================================================
     * LINUX
     * ======================================================
     */

    if (!isLinux()) {
        return false;
    }

    /*
     * APT / Debian / Ubuntu
     */

    if (canUseApt()) {
        console.log(
            `🐧 APT detected. Installing ${packageName}...`
        );

        if (process.getuid && process.getuid() === 0) {
            return (
                run("apt-get", ["update"]) &&
                run("apt-get", [
                    "install",
                    "-y",
                    packageName
                ])
            );
        }

        if (canUseSudo()) {
            return (
                run("sudo", [
                    "apt-get",
                    "update"
                ]) &&
                run("sudo", [
                    "apt-get",
                    "install",
                    "-y",
                    packageName
                ])
            );
        }

        console.log(
            "⚠️ APT is available, but root/sudo permission is unavailable."
        );

        return false;
    }

    /*
     * Alpine
     */

    if (canUseApk()) {
        console.log(
            `🐧 Alpine APK detected. Installing ${packageName}...`
        );

        return run("apk", [
            "add",
            "--no-cache",
            packageName
        ]);
    }

    /*
     * Fedora / RHEL
     */

    if (canUseDnf()) {
        console.log(
            `🐧 DNF detected. Installing ${packageName}...`
        );

        if (process.getuid && process.getuid() === 0) {
            return run("dnf", [
                "install",
                "-y",
                packageName
            ]);
        }

        if (canUseSudo()) {
            return run("sudo", [
                "dnf",
                "install",
                "-y",
                packageName
            ]);
        }

        return false;
    }

    /*
     * Older RHEL / CentOS
     */

    if (canUseYum()) {
        console.log(
            `🐧 YUM detected. Installing ${packageName}...`
        );

        if (process.getuid && process.getuid() === 0) {
            return run("yum", [
                "install",
                "-y",
                packageName
            ]);
        }

        if (canUseSudo()) {
            return run("sudo", [
                "yum",
                "install",
                "-y",
                packageName
            ]);
        }

        return false;
    }

    /*
     * Arch
     */

    if (canUsePacman()) {
        console.log(
            `🐧 Pacman detected. Installing ${packageName}...`
        );

        if (process.getuid && process.getuid() === 0) {
            return run("pacman", [
                "-Sy",
                "--noconfirm",
                packageName
            ]);
        }

        if (canUseSudo()) {
            return run("sudo", [
                "pacman",
                "-Sy",
                "--noconfirm",
                packageName
            ]);
        }

        return false;
    }

    return false;
}

/*
 * ==========================================================
 * HEADER
 * ==========================================================
 */

console.log("");
console.log("========================================");
console.log(" The-whisperer Bot Automatic Setup");
console.log(" Media + Telegram Support");
console.log("========================================");
console.log("");

console.log(`🖥️ Platform: ${platform}`);
console.log(`🏗️ Architecture: ${arch}`);

if (isTermux()) {
    console.log("📱 Environment: Termux");
} else if (isLinux()) {
    console.log("🐧 Environment: Linux");
} else {
    console.log("ℹ️ Environment: Other");
}

console.log("");

/*
 * ==========================================================
 * NODE.JS
 * ==========================================================
 */

console.log("🔎 Checking Node.js...");

if (!commandExists(process.execPath, ["--version"])) {
    console.error("❌ Node.js is not available.");
    process.exit(1);
}

console.log(`✅ Node.js: ${process.version}`);

/*
 * ==========================================================
 * NODE MODULES
 * ==========================================================
 */

console.log("");
console.log("📦 Checking Node.js packages...");

const nodeModules = path.join(
    rootDir,
    "node_modules"
);

if (fs.existsSync(nodeModules)) {
    console.log("✅ node_modules directory exists.");
} else {
    console.log("⚠️ node_modules is missing.");
    console.log("📦 Running npm install...");

    const npmCommand =
        platform === "win32"
            ? "npm.cmd"
            : "npm";

    if (!run(npmCommand, ["install"])) {
        console.error("❌ npm install failed.");
        process.exit(1);
    }

    console.log("✅ Node.js packages installed.");
}

/*
 * ==========================================================
 * PYTHON
 * ==========================================================
 */

console.log("");
console.log("🐍 Checking Python...");

let pythonCommand = null;

if (commandExists("python3", ["--version"])) {
    pythonCommand = "python3";
} else if (commandExists("python", ["--version"])) {
    pythonCommand = "python";
}

if (!pythonCommand) {
    console.log("⚠️ Python is not installed.");

    if (isTermux()) {
        console.log("");
        console.log("📱 Install with:");
        console.log("   pkg install python");
    } else if (isLinux()) {
        console.log("");
        console.log("🐧 Linux container needs Python.");
    }

    console.log(
        "⚠️ Telegram and yt-dlp features may not work."
    );
} else {
    console.log(
        `✅ Python: ${runCapture(
            pythonCommand,
            ["--version"]
        )}`
    );
}

/*
 * ==========================================================
 * PYTHON REQUIREMENTS
 * ==========================================================
 */

if (pythonCommand) {
    console.log("");
    console.log("📚 Checking Python requirements...");

    const requirementsFile = path.join(
        rootDir,
        "requirements.txt"
    );

    if (fs.existsSync(requirementsFile)) {
        console.log(
            "📄 requirements.txt found."
        );

        const pipResult = run(
            pythonCommand,
            [
                "-m",
                "pip",
                "install",
                "-U",
                "-r",
                requirementsFile
            ]
        );

        if (pipResult) {
            console.log(
                "✅ Python requirements installed."
            );
        } else {
            console.log(
                "⚠️ Could not automatically install all Python requirements."
            );
        }
    } else {
        console.log(
            "⚠️ requirements.txt not found."
        );
    }
}

/*
 * ==========================================================
 * TELETHON
 * ==========================================================
 */

if (pythonCommand) {
    console.log("");
    console.log("📡 Checking Telethon...");

    const telethonVersion = runCapture(
        pythonCommand,
        [
            "-c",
            "import telethon; print(telethon.__version__)"
        ]
    );

    if (telethonVersion) {
        console.log(
            `✅ Telethon: ${telethonVersion}`
        );
    } else {
        console.log(
            "⚠️ Telethon is not available."
        );

        const installed = run(
            pythonCommand,
            [
                "-m",
                "pip",
                "install",
                "-U",
                "telethon"
            ]
        );

        if (installed) {
            console.log(
                "✅ Telethon installed."
            );
        } else {
            console.log(
                "❌ Telethon installation failed."
            );
        }
    }
}

/*
 * ==========================================================
 * TELEGRAM CONFIGURATION
 * ==========================================================
 */

console.log("");
console.log("========================================");
console.log(" Telegram Configuration");
console.log("========================================");
console.log("");

const telegramConfig = path.join(
    rootDir,
    "telegram_config.py"
);

const telegramExample = path.join(
    rootDir,
    "telegram_config.example.py"
);

if (fs.existsSync(telegramConfig)) {
    console.log(
        "✅ telegram_config.py found."
    );
} else {
    console.log(
        "⚠️ telegram_config.py is missing."
    );

    if (fs.existsSync(telegramExample)) {
        try {
            fs.copyFileSync(
                telegramExample,
                telegramConfig
            );

            console.log(
                "📄 Created telegram_config.py from telegram_config.example.py"
            );
        } catch (error) {
            console.log(
                "⚠️ Could not create telegram_config.py:"
            );

            console.log(
                error.message
            );
        }
    } else {
        console.log(
            "⚠️ telegram_config.example.py is also missing."
        );
    }
}

/*
 * ==========================================================
 * VALIDATE TELEGRAM CREDENTIALS
 * ==========================================================
 */

if (
    pythonCommand &&
    fs.existsSync(telegramConfig)
) {
    const credentialCheck = spawnSync(
        pythonCommand,
        [
            "-c",
            `
from telegram_config import API_ID, API_HASH
print("API_ID:", bool(API_ID))
print("API_HASH:", bool(API_HASH))
`
        ],
        {
            cwd: rootDir,
            encoding: "utf8",
            stdio: [
                "ignore",
                "pipe",
                "pipe"
            ]
        }
    );

    if (credentialCheck.status === 0) {
        const output =
            credentialCheck.stdout || "";

        if (
            output.includes("API_ID: True") &&
            output.includes("API_HASH: True")
        ) {
            console.log(
                "✅ Telegram API credentials are configured."
            );
        } else {
            console.log(
                "⚠️ Telegram API credentials are not configured."
            );

            console.log("");
            console.log(
                "Edit telegram_config.py and add your:"
            );
            console.log(
                "   API_ID"
            );
            console.log(
                "   API_HASH"
            );
        }
    } else {
        console.log(
            "⚠️ Could not validate telegram_config.py."
        );
    }
}

/*
 * ==========================================================
 * TELEGRAM SESSION
 * ==========================================================
 */

console.log("");
console.log("🔐 Checking Telegram session...");

const sessionFile = path.join(
    rootDir,
    "telegram_session.session"
);

if (fs.existsSync(sessionFile)) {
    console.log(
        "✅ Telegram session file found."
    );

    console.log(
        "🔐 Telegram account login has already been completed."
    );
} else {
    console.log(
        "⚠️ Telegram session file not found."
    );

    console.log("");
    console.log(
        "ℹ️ A fresh installation requires a one-time Telegram login."
    );

    console.log(
        "After configuring telegram_config.py, run:"
    );

    console.log(
        "   python lib/telegram_stickers.py \"https://t.me/addstickers/DEDSECH\" telegram_test"
    );

    console.log("");
    console.log(
        "You will be asked for your Telegram phone number"
    );

    console.log(
        "and the verification code."
    );

    console.log(
        "After successful login, telegram_session.session"
    );

    console.log(
        "will be created and reused by the bot."
    );
}

/*
 * ==========================================================
 * YT-DLP
 * ==========================================================
 */

console.log("");
console.log("🎵 Checking yt-dlp...");

let ytDlpReady = commandExists(
    "yt-dlp",
    ["--version"]
);

if (ytDlpReady) {
    console.log(
        `✅ yt-dlp: ${runCapture(
            "yt-dlp",
            ["--version"]
        )}`
    );
} else {
    console.log(
        "⚠️ yt-dlp is not installed."
    );

    let installed = false;

    if (pythonCommand) {
        console.log(
            "📦 Installing yt-dlp through Python..."
        );

        installed = run(
            pythonCommand,
            [
                "-m",
                "pip",
                "install",
                "-U",
                "yt-dlp"
            ]
        );
    }

    if (!installed && isTermux()) {
        installed =
            installSystemPackage("yt-dlp");
    }

    if (installed) {
        ytDlpReady = commandExists(
            "yt-dlp",
            ["--version"]
        );

        if (ytDlpReady) {
            console.log(
                "✅ yt-dlp is ready."
            );
        }
    }

    if (!ytDlpReady) {
        console.log(
            "❌ yt-dlp could not be installed automatically."
        );
    }
}

/*
 * ==========================================================
 * FFMPEG
 * ==========================================================
 */

console.log("");
console.log("🎬 Checking FFmpeg...");

let ffmpegReady = commandExists(
    "ffmpeg",
    ["-version"]
);

if (ffmpegReady) {
    console.log(
        `✅ ${runCapture(
            "ffmpeg",
            ["-version"]
        ).split("\n")[0]}`
    );
} else {
    console.log(
        "⚠️ FFmpeg is not installed."
    );

    console.log(
        "📦 Attempting automatic installation..."
    );

    const installed =
        installSystemPackage("ffmpeg");

    ffmpegReady =
        installed &&
        commandExists(
            "ffmpeg",
            ["-version"]
        );

    if (ffmpegReady) {
        console.log(
            "✅ FFmpeg installed successfully."
        );
    } else {
        console.log(
            "❌ FFmpeg could not be installed automatically."
        );
    }
}

/*
 * ==========================================================
 * FINAL CHECK
 * ==========================================================
 */

console.log("");
console.log("========================================");
console.log(" Final Dependency Check");
console.log("========================================");
console.log("");

const nodeReady =
    commandExists(
        process.execPath,
        ["--version"]
    );

const pythonReady =
    pythonCommand &&
    commandExists(
        pythonCommand,
        ["--version"]
    );

const telegramConfigReady =
    fs.existsSync(telegramConfig);

const telegramSessionReady =
    fs.existsSync(sessionFile);

const finalChecks = [
    [
        "Node.js",
        nodeReady
    ],
    [
        "Python",
        pythonReady
    ],
    [
        "yt-dlp",
        ytDlpReady
    ],
    [
        "FFmpeg",
        ffmpegReady
    ],
    [
        "Telegram config",
        telegramConfigReady
    ],
    [
        "Telegram session",
        telegramSessionReady
    ]
];

for (const [name, ready] of finalChecks) {
    if (ready) {
        console.log(
            `✅ ${name} ready`
        );
    } else {
        console.log(
            `⚠️ ${name} not ready`
        );
    }
}

console.log("");

if (
    nodeReady &&
    pythonReady &&
    ytDlpReady &&
    ffmpegReady &&
    telegramConfigReady &&
    telegramSessionReady
) {
    console.log(
        "🎉 Media + Telegram setup is completely ready."
    );
} else {
    console.log(
        "⚠️ Setup completed with some items still requiring attention."
    );

    console.log("");

    if (!telegramConfigReady) {
        console.log(
            "➡️ Configure telegram_config.py"
        );
    }

    if (
        telegramConfigReady &&
        !telegramSessionReady
    ) {
        console.log(
            "➡️ Perform the one-time Telegram login to create the session."
        );
    }

    if (!ytDlpReady) {
        console.log(
            "➡️ Install yt-dlp."
        );
    }

    if (!ffmpegReady) {
        console.log(
            "➡️ Install FFmpeg."
        );
    }
}

console.log("");
console.log(
    "🚀 Setup finished."
);
console.log("");
