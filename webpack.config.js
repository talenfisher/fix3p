const path = require("path");

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/assets/js/main.ts'),
    output: {
        path: path.resolve(__dirname, 'src/assets/dist/'),
        filename: 'fix3p.bundle.js'
    },
    module: {
        rules: [
            {
                test: /.ts$/,
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