const Bundler = require("parcel-bundler");
const path = require("path");
const package = require("./package.json");
const fs = require("fs");
const static_files = package.staticFiles;

const IN_DIR = __dirname + "/src/";
const OUT_DIR = __dirname + "/dist/";
const MANIFEST_FILE = OUT_DIR + "manifest.json";

function getFaviconFilename() {
    for(let file of fs.readdirSync(OUT_DIR)) {
        if(file.match(/favicon.(.*).png/)) {
            return file;
        }
    }
}

function updateManifest() {
    let manifest = require(MANIFEST_FILE);
    let faviconFilename = getFaviconFilename();

    manifest.icons["128"] = faviconFilename;
    manifest.browser_action.default_icon["128"] = faviconFilename;
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest));
}

void function main() {
    // get entry files
    let entryFiles = [];
    for(let file of fs.readdirSync(IN_DIR)) {
        if(file.match(/.html$/)) {
            entryFiles.push(IN_DIR + file);
        }
    }

    const bundler = new Bundler(entryFiles, {
        outDir: OUT_DIR,
        watch: process.argv.includes("--watch"),
        publicUrl: process.argv.includes("--serve") || process.env.NODE_ENV == "development" ? null : "./",
    });

    bundler.on("bundled", bundle => {
        for(let file of static_files) {
            fs.copyFileSync(IN_DIR + file, OUT_DIR + file);
        }

        updateManifest();
    });

    if(process.argv.includes("--serve")) {
        bundler.serve();

    } else {
        bundler.bundle();

    }
}();