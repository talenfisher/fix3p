module.exports = {
    launch: {
        dumpio: false,
        headless: process.env.HEADLESS != 'false',
        args: ["--no-sandbox"]
    },

    server: {
        command: 'npm run start',
        port: 1234,
        launchTimeout: 60000,
        debug: true
    }
}