module.exports = {
    launch: {
        dumpio: true,
        headless: process.env.HEADLESS != 'false',
        args: ["--no-sandbox"]
    },

    server: {
        command: 'npm run serve',
        port: 8080,
        launchTimeout: 10000,
        debug: true
    }
}