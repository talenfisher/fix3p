import { resolve } from "path";
import { promisify } from "util";
import { readdirSync, fstat, readFileSync as read } from "fs";
import { url } from "../vars";
const sleep = promisify(setTimeout);

for(let file of readdirSync(resolve(__dirname, "../data/good"))) {

    // after upload
    describe(`Editor: <${file}> (good, after upload, no rendering)`, () => {
        beforeEach(async () => {
            await page.goto(url);

            // turn off rendering
            page.evaluate(`fix3p.render = false;`);

            let input = await page.$(".upload input");
            await input.uploadFile(resolve(__dirname, "../data/good/"+file));
            await page.waitForSelector(`[view="editor"]`);
            await sleep(1000);
        });

        it("Should be visible", async () => {
            let el = await page.$(`fix3p-editor`);
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(true);
        }, 7000);

        it("Record1 should be visible", async () => {
            let el = await page.waitForSelector(`[data-tag="Record1"]`);
            let visible = await el.isIntersectingViewport();
            
            expect(visible).toBe(true);
        });

        it("Clicking the Record2 tab should make Record2 visible", async () => {
            (await page.waitForSelector(`div.tab:nth-of-type(2)`)).click();
            
            await sleep(200);
            let el = await page.waitForSelector(`[data-tag="Record2"]`);
            let visible = await el.isIntersectingViewport();
            
            expect(visible).toBe(true);
        });

        it("Clicking the Record3 tab should make Record3 visible", async () => {
            (await page.waitForSelector(`div.tab:nth-of-type(3)`)).click();

            await sleep(200);
            let el = await page.waitForSelector(`[data-tag="Record3"]`);
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(true);
        });

        it("Clicking the Record4 tab should make Record4 visible", async () => {
            (await page.waitForSelector(`div.tab:nth-of-type(4)`)).click();

            await sleep(200);
            let el = await page.$(`[data-tag="Record4"]`);
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(true);
        });

        it("Clicking back to the Record1 tab should make Record1 visible again", async () => {
            (await page.waitForSelector(`div.tab:nth-of-type(4)`)).click();

            await sleep(200);
            (await page.waitForSelector(`div.tab:nth-of-type(1)`)).click();

            await sleep(200);
            let el = await page.$(`[data-tag="Record1"]`);
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(true);
        }, 10000);

        it("Should become invisible after clicking the back/close button", async () => {
            (await page.$(".back")).click();
            
            await sleep(1000);
            let el = await page.$(`fix3p-editor`);
            let visible = await el.isIntersectingViewport();

            expect(visible).toBe(false);
        });

        it("Should disable the stage/render area", () => {
            return page.waitForSelector(".stage[disabled]");
        });

        describe("Labels/Inputs", () => {
            it("Fields that represent a date should be datetime-local inputs", async () => {
                const selector = `[data-tag="Date"] input`;

                await page.waitForSelector(selector);
                let type = await page.evaluate(`document.querySelector('${selector}').getAttribute("type")`);
                expect(type).toBe("datetime-local");
            });

            it("MD5ChecksumPointData label should be transformed to MD5 Checksum:", async () => {
                const selector = `[data-tag="MD5ChecksumPointData"] label`;
                await page.waitForSelector(selector);
                
                let value = await page.evaluate(`document.querySelector('${selector}').innerHTML`);
                expect(value).toBe("MD5 Checksum:");
            });
        });
    });
}