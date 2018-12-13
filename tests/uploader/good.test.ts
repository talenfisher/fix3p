import { resolve } from "path";
import { promisify } from "util";
import { readdirSync } from "fs";

const sleep = promisify(setTimeout);


for(let file of readdirSync(resolve(__dirname, "../data/good"))) {
    describe(`Uploader <${file}> (good)`, () => {
        var input;

        beforeEach(async () => {
            await page.goto("http://localhost:8080/index.html");
            page.evaluate(`fix3p.render = false;`);
            input = await page.$(".upload input");
            input.uploadFile(resolve(__dirname, "../data/good/"+file));
            await sleep(1000);
        });

        it("Should shift to editor view when supplied a valid X3P file", async () => {
            let editor = await page.$(".view");
            let visible = await editor.isIntersectingViewport();

            expect(visible).toBe(true);
        });

        it("Should become visible again after closing the editor", async () => {
            (await page.$(".back")).click();
            await sleep(1000);
            
            let el = await page.$(".upload");
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(true);
        });
    });
}
