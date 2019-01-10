module.exports = {
    launch: {
        dumpio: false,
        headless: process.env.HEADLESS != 'false',
        args: ["--no-sandbox"]
    },

    server: {
        command: 'npx http-server -c-2 -p 1432 src > /dev/null',
        port: 1432,
        launchTimeout: 10000,
        debug: true
    }
}