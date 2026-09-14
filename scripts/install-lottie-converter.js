const fs = require("fs");
const path = require("path");
const https = require("https");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const INSTALL_DIR = path.join(ROOT, ".lottie-converter");
const ZIP_PATH = path.join(ROOT, ".lottie-converter.zip");

const VERSION = "v1.2.0";

function detectAsset() {
    switch (process.arch) {
        case "x64":
            return "lottie-converter.linux.amd64.zip";

        case "arm64":
            return "lottie-converter.linux.arm64.zip";

        default:
            throw new Error(
                `Unsupported CPU architecture: ${process.arch}`
            );
    }
}

function download(url, destination) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);

        https.get(url, response => {
            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                file.close();
                fs.unlinkSync(destination);

                return download(
                    response.headers.location,
                    destination
                ).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(destination);

                reject(
                    new Error(
                        `Download failed: HTTP ${response.statusCode}`
                    )
                );

                return;
            }

            response.pipe(file);

            file.on("finish", () => {
                file.close(resolve);
            });
        }).on("error", error => {
            file.close();

            if (fs.existsSync(destination)) {
                fs.unlinkSync(destination);
            }

            reject(error);
        });
    });
}

async function main() {
    const asset = detectAsset();

    const executable = path.join(
        INSTALL_DIR,
        "bin",
        "lottie_to_png"
    );

    if (fs.existsSync(executable)) {
        console.log(
            `Lottie converter already installed for ${process.arch}.`
        );
        return;
    }

    const url =
        `https://github.com/ed-asriyan/lottie-converter/releases/download/${VERSION}/${asset}`;

    console.log(
        `Installing Lottie converter ${VERSION} (${process.arch})...`
    );

    fs.mkdirSync(INSTALL_DIR, {
        recursive: true
    });

    await download(url, ZIP_PATH);

    console.log("Lottie converter archive downloaded.");

    execFileSync(
        "unzip",
        [
            "-o",
            ZIP_PATH,
            "-d",
            INSTALL_DIR
        ],
        {
            stdio: "inherit"
        }
    );

    fs.chmodSync(
        executable,
        0o755
    );

    fs.unlinkSync(ZIP_PATH);

    console.log(
        `Lottie converter installed successfully: ${executable}`
    );
}

main().catch(error => {
    console.error(
        "Lottie converter installation failed:",
        error.message
    );

    process.exit(1);
});
