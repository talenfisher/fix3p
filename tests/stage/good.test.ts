import { resolve } from "path";
import { promisify } from "util";
import { readdirSync } from "fs";

import { url, dataFiles } from "../vars";

const sleep = promisify(setTimeout);

for(let file of readdirSync(dataFiles.good)) {
    describe(`Stage <${file}> (good)`, () => {
        beforeEach(async () => {
            await page.goto(url);

            let input = await page.$(".upload input");
            await input.uploadFile(resolve(`${dataFiles.good}${file}`));
            await page.waitForSelector("[data-tag]");
        });
        
        describe("Fullscreen Button", () => { 
            
            /**
             * These tests will not work when puppeteer is run in headless mode
             */
            
            it("Should enlarge the stage into fullscreen mode", async () => {
                if(process.env.HEADLESS !== 'false') return;

                let btn = await page.$(".fullscreen-btn");
                await btn.click();
                await sleep(500);

                let result = await page.evaluate(`document.fullscreenElement !== null`);
                expect(result).toBe(true);
            });

            it("Should return the stage to normal size if already in fullscreen mode", async () => {
                if(process.env.HEADLESS !== 'false') return;

                await page.evaluate(`
                    (function() {
                        let el = document.querySelector(".stage canvas");
                        el.requestFullscreen();
                    })();
                `);
                
                await sleep(500);
                await page.evaluate(`
                    (function() {
                        let el = document.querySelector(".fullscreen-btn");
                        el.click();
                    })();
                `);

                await sleep(500);
                let result = await page.evaluate(`document.fullscreenElement === null`);
                expect(result).toBe(true);
            });
        });
    });
}
