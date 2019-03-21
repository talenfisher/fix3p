const Bundler = require("parcel-bundler");
const path = require("path");
const package = require("./package.json");
const fs = require("fs");
const static_files = package.staticFiles;

const IN_DIR = __dirname + "/src/";
const OUT_DIR = __dirname + "/dist/";

// get entry files
let entryFiles = [];
for(let file of fs.readdirSync(IN_DIR)) {
    if(file.match(/.html$/)) {
        entryFiles.push(IN_DIR + file);
    }
}

const bundler = new Bundler(entryFiles, {
    outDir: OUT_DIR,
    watch: process.argv.includes("--watch")
});

bundler.on("bundled", bundle => {
    for(let file of static_files) {
        fs.copyFileSync(IN_DIR + file, OUT_DIR + file);
    }
});

if(process.argv.includes("--serve")) {
    bundler.serve();

} else {
    bundler.bundle();

}