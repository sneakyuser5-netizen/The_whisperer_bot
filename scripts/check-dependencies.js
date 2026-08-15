const { execFileSync } = require("child_process");
const os = require("os");

const checks = [
    {
        name: "Node.js",
        command: process.execPath,
        args: ["--version"],
        required: true
    },
    {
        name: "yt-dlp",
        command: "yt-dlp",
        args: ["--version"],
        required: true
    },
    {
        name: "FFmpeg",
        command: "ffmpeg",
        args: ["-version"],
        required: true
    },
    {
        name: "Python",
        command: process.platform === "win32" ? "python" : "python3",
        args: ["--version"],
        required: false
    }
];

function check(item) {
    try {
        const output = execFileSync(
            item.command,
            item.args,
            {
                stdio: ["ignore", "pipe", "pipe"],
                encoding: "utf8"
            }
        ).trim();

        const firstLine = output.split("\n")[0];

        console.log(`✅ ${item.name}: ${firstLine}`);
        return true;

    } catch (error) {
        console.log(`❌ ${item.name}: NOT FOUND`);
        return false;
    }
}

console.log("");
console.log("========================================");
console.log(" The-whisperer Bot Dependency Check");
console.log("========================================");
console.log("");

console.log(`🖥️ Platform: ${os.platform()}`);
console.log(`🏗️ Architecture: ${os.arch()}`);
console.log("");

let failed = false;

for (const item of checks) {
    const ok = check(item);

    if (!ok && item.required) {
        failed = true;
    }
}

console.log("");

if (failed) {
    console.log("⚠️ Some required dependencies are missing.");
    console.log("");

    if (os.platform() === "android") {
        console.log("📱 Termux:");
        console.log("   pkg install ffmpeg python");
        console.log("   python -m pip install -U yt-dlp");
    } else if (os.platform() === "linux") {
        console.log("🐧 Linux:");
        console.log("   Install FFmpeg using your distribution package manager.");
        console.log("   python3 -m pip install -U yt-dlp");
    } else if (os.platform() === "darwin") {
        console.log("🍎 macOS:");
        console.log("   brew install ffmpeg");
        console.log("   python3 -m pip install -U yt-dlp");
    } else if (os.platform() === "win32") {
        console.log("🪟 Windows:");
        console.log("   Install FFmpeg and yt-dlp.");
        console.log("   Make sure both are available in PATH.");
    }

    console.log("");
    process.exitCode = 1;
} else {
    console.log("🎉 All required external dependencies are available.");
    console.log("");
}
