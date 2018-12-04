const path = require("path");

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/assets/js/main.js'),
    output: {
        path: path.resolve(__dirname, 'src/assets/dist/'),
        filename: 'fix3p.bundle.js'
    },
    module: {
        rules: [
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
        symlinks: false
    },
    externals: ["ws"]
}