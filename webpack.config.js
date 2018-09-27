const path = require("path");

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/assets/js/main.js'),
    output: {
        path: path.resolve(__dirname, 'src/assets/dist/'),
        filename: 'fix3p.bundle.js'
    },
    node: {
        fs: 'empty'
    }
}