const path = require("path");
const fs = require("fs");

const X3PJS_PATH = path.resolve(__dirname, "node_modules/x3p.js/dist");

let workerName;
for(let file of fs.readdirSync(X3PJS_PATH)) {
    if(file.match(/worker/) && !file.match(/\.map$/)) {
        workerName = file.replace(".js", "");
    }
}

module.exports = {
    mode: 'production',
    entry: {
        [workerName]: `${X3PJS_PATH}/${workerName}.js`,
        "fix3p.bundle": path.resolve(__dirname, 'src/assets/js/main.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'src/assets/dist/'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            { 
                test: /node_modules/, 
                use: 'ify-loader'
            }
        ]
    },
    node: {
        fs: 'empty' 
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    externals: ["ws"]
}