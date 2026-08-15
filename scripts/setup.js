const {
    execFileSync,
    spawnSync
} = require("child_process");

const fs = require("fs");
const os = require("os");
const path = require("path");

const platform = os.platform();
const arch = os.arch();

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

function runQuiet(command, args) {
    try {
        execFileSync(command, args, {
            stdio: "ignore"
        });
        return true;
    } catch {
        return false;
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
     * ------------------------------------------------------
     * TERMUX
     * ------------------------------------------------------
     */

    if (isTermux() && commandExists("pkg", ["--help"])) {
        console.log(`📱 Termux detected. Installing ${packageName}...`);

        return run("pkg", [
            "install",
            "-y",
            packageName
        ]);
    }

    /*
     * ------------------------------------------------------
     * LINUX
     * ------------------------------------------------------
     */

    if (!isLinux()) {
        return false;
    }

    /*
     * APT
     */

    if (canUseApt()) {
        console.log(`🐧 APT detected. Installing ${packageName}...`);

        if (process.getuid && process.getuid() === 0) {
            return run("apt-get", [
                "update"
            ]) &&
            run("apt-get", [
                "install",
                "-y",
                packageName
            ]);
        }

        if (canUseSudo()) {
            return run("sudo", [
                "apt-get",
                "update"
            ]) &&
            run("sudo", [
                "apt-get",
                "install",
                "-y",
                packageName
            ]);
        }

        console.log(
            "⚠️ APT is available, but this process has no root/sudo permission."
        );

        return false;
    }

    /*
     * APK - Alpine Linux
     */

    if (canUseApk()) {
        console.log(`🐧 Alpine APK detected. Installing ${packageName}...`);

        return run("apk", [
            "add",
            "--no-cache",
            packageName
        ]);
    }

    /*
     * DNF
     */

    if (canUseDnf()) {
        console.log(`🐧 DNF detected. Installing ${packageName}...`);

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
    }

    /*
     * YUM
     */

    if (canUseYum()) {
        console.log(`🐧 YUM detected. Installing ${packageName}...`);

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
    }

    /*
     * PACMAN
     */

    if (canUsePacman()) {
        console.log(`🐧 Pacman detected. Installing ${packageName}...`);

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
 * NODE
 * ==========================================================
 */

console.log("🔎 Checking Node.js...");

if (!commandExists(process.execPath)) {
    console.error("❌ Node.js is not available.");
    process.exit(1);
}

console.log(
    `✅ Node.js: ${process.version}`
);

/*
 * ==========================================================
 * NPM DEPENDENCIES
 * ==========================================================
 */

console.log("");
console.log("📦 Checking Node.js packages...");

/*
 * Don't recursively run npm install if this script was
 * already launched by npm start.
 *
 * npm itself normally installs dependencies during the
 * hosting platform's build stage.
 */

const nodeModules = path.join(
    process.cwd(),
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
        console.log("📱 Install Python in Termux with:");
        console.log("   pkg install python");
    } else if (isLinux()) {
        console.log("");
        console.log("🐧 This Linux container needs Python installed.");
    }

    console.log(
        "⚠️ Telegram sticker/media features may not work."
    );
} else {
    const pythonVersion = spawnSync(
        pythonCommand,
        ["--version"],
        {
            encoding: "utf8"
        }
    );

    console.log(
        `✅ Python: ${(pythonVersion.stdout || pythonVersion.stderr).trim()}`
    );
}

/*
 * ==========================================================
 * TELETHON
 * ==========================================================
 */

if (pythonCommand) {
    console.log("");
    console.log("📡 Checking Telethon...");

    const telethonCheck = spawnSync(
        pythonCommand,
        [
            "-c",
            "import telethon; print(telethon.__version__)"
        ],
        {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
        }
    );

    if (telethonCheck.status === 0) {
        console.log(
            `✅ Telethon: ${telethonCheck.stdout.trim()}`
        );
    } else {
        console.log("⚠️ Telethon is not installed.");

        console.log("📦 Attempting to install Telethon...");

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
            console.log("✅ Telethon installed.");
        } else {
            console.log(
                "⚠️ Could not automatically install Telethon."
            );
        }
    }
}

/*
 * ==========================================================
 * YT-DLP
 * ==========================================================
 */

console.log("");
console.log("🎵 Checking yt-dlp...");

if (commandExists("yt-dlp", ["--version"])) {
    let version = "";

    try {
        version = execFileSync(
            "yt-dlp",
            ["--version"],
            {
                encoding: "utf8"
            }
        ).trim();
    } catch {}

    console.log(`✅ yt-dlp: ${version}`);
} else {
    console.log("⚠️ yt-dlp is not installed.");

    let installed = false;

    /*
     * First try Python.
     */

    if (pythonCommand) {
        console.log("📦 Installing yt-dlp through Python...");

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

    /*
     * If Python installation failed, try package manager.
     */

    if (!installed && isTermux()) {
        console.log("📱 Trying Termux package manager...");

        installed = installSystemPackage("yt-dlp");
    }

    if (!installed) {
        console.log("");
        console.log(
            "⚠️ yt-dlp could not be installed automatically."
        );

        if (isTermux()) {
            console.log(
                "Run: pkg install python"
            );
            console.log(
                "Then: python -m pip install -U yt-dlp"
            );
        } else {
            console.log(
                "Install yt-dlp and make sure it is available in PATH."
            );
        }
    } else {
        console.log("✅ yt-dlp installation completed.");
    }
}

/*
 * ==========================================================
 * FFMPEG
 * ==========================================================
 */

console.log("");
console.log("🎬 Checking FFmpeg...");

if (commandExists("ffmpeg", ["-version"])) {
    let version = "";

    try {
        version = execFileSync(
            "ffmpeg",
            ["-version"],
            {
                encoding: "utf8"
            }
        ).split("\n")[0];
    } catch {}

    console.log(`✅ ${version}`);
} else {
    console.log("⚠️ FFmpeg is not installed.");

    console.log(
        "📦 Attempting automatic FFmpeg installation..."
    );

    const installed = installSystemPackage("ffmpeg");

    if (installed && commandExists("ffmpeg", ["-version"])) {
        console.log("✅ FFmpeg installed successfully.");
    } else {
        console.log("");
        console.log(
            "⚠️ FFmpeg could not be installed automatically."
        );

        if (isTermux()) {
            console.log("");
            console.log("📱 Termux:");
            console.log("   pkg install ffmpeg");
        } else if (isLinux()) {
            console.log("");
            console.log(
                "🐧 Linux hosting:"
            );
            console.log(
                "   The hosting container must provide FFmpeg or allow package installation."
            );
        }
    }
}

/*
 * ==========================================================
 * FINAL VERIFICATION
 * ==========================================================
 */

console.log("");
console.log("========================================");
console.log(" Final Dependency Check");
console.log("========================================");
console.log("");

const finalChecks = [
    ["Node.js", process.execPath, ["--version"]],
    ["yt-dlp", "yt-dlp", ["--version"]],
    ["FFmpeg", "ffmpeg", ["-version"]]
];

let missing = [];

for (const [name, command, args] of finalChecks) {
    if (commandExists(command, args)) {
        console.log(`✅ ${name} ready`);
    } else {
        console.log(`❌ ${name} missing`);
        missing.push(name);
    }
}

if (pythonCommand && commandExists(pythonCommand, ["--version"])) {
    console.log("✅ Python ready");
} else {
    console.log("⚠️ Python missing");
}

console.log("");

if (missing.length > 0) {
    console.log(
        `⚠️ Missing required dependency: ${missing.join(", ")}`
    );

    console.log("");

    console.log(
        "The bot can still start, but commands requiring these"
    );

    console.log(
        "dependencies may not work."
    );

    console.log("");
} else {
    console.log(
        "🎉 All required .play dependencies are ready."
    );

    console.log("");
}

console.log("🚀 Setup completed.");
console.log("");
