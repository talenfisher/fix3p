import { resolve } from "path";
import { promisify } from "util";
import { readdirSync } from "fs";
import { url } from "../vars";

const sleep = promisify(setTimeout);


for(let file of readdirSync(resolve(__dirname, "../data/good"))) {
    describe(`Uploader <${file}> (good)`, () => {
        var input;

        beforeEach(async () => {
            await page.goto(url);
            page.evaluate(`fix3p.render = false;`);
            input = await page.$(".upload input");
            input.uploadFile(resolve(__dirname, "../data/good/"+file));
        });

        describe("Loading popup", () => {
            it("Should display", async () => {
                let popup = await page.waitForSelector(".loading");
                let visible = await popup.isIntersectingViewport();
    
                expect(visible).toBe(true);
            });
        });
 
        it("Should shift to editor view when supplied a valid X3P file", async () => {
            await page.waitForSelector("[data-tag]");

            await sleep(200);
            let editor = await page.waitForSelector(".view");
            let visible = await editor.isIntersectingViewport();
            
            expect(visible).toBe(true);
        });

        it("Should become visible again after closing the editor", async () => {
            await page.waitForSelector("[data-tag]");

            await sleep(200);
            (await page.$(".back")).click();
            
            await sleep(1200);
            let el = await page.waitForSelector(".upload");
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(true);
        });
    });
}
