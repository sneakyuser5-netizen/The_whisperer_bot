const fs = require("fs");
const https = require("https");
const { execFileSync } = require("child_process");

function run(args, options = {}) {
    return execFileSync("python3", args, {
        stdio: "inherit",
        ...options
    });
}

function pipWorks() {
    try {
        run(["-m", "pip", "--version"]);
        return true;
    } catch {
        return false;
    }
}

console.log("Checking Python and pip...");

if (!pipWorks()) {
    console.log("pip not found. Trying ensurepip...");

    try {
        run(["-m", "ensurepip", "--upgrade", "--user"]);
    } catch {
        console.log("ensurepip unavailable. Bootstrapping pip with official PyPA installer...");

        const output = "/tmp/get-pip.py";

        execFileSync("node", ["-e", `
            const fs=require("fs");
            const https=require("https");
            const out=fs.createWriteStream(${JSON.stringify(output)});
            https.get("https://bootstrap.pypa.io/get-pip.py", res => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    https.get(res.headers.location, r => r.pipe(out));
                } else {
                    res.pipe(out);
                }
                out.on("finish", () => out.close(() => process.exit(0)));
            }).on("error", err => {
                console.error(err);
                process.exit(1);
            });
        `]);

        run([output, "--user"]);
        fs.rmSync(output, { force: true });
    }
}

console.log("Installing Python dependencies...");

run(["-m", "pip", "install", "--user", "-r", "requirements.txt"]);

console.log("Python dependencies installed successfully.");
