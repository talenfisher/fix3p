import { resolve } from "path";
import { promisify } from "util";
import { readdirSync, fstat } from "fs";
const sleep = promisify(setTimeout);


for(let file of readdirSync(resolve(ROOT, "testfiles"))) {
    console.log(file);
} 

// before upload
describe("Editor (good, before upload)", () => {
    beforeEach(async () => {
        await page.goto("http://localhost:8080/index.html");
    });

    it("Should initially be invisible", async () => {
        let el = await page.$(".view");
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(false);
    });
});

// after upload
describe("Editor (good, after upload, no rendering)", () => {
    beforeEach(async () => {
        await page.goto("http://localhost:8080/index.html");

        // turn off rendering
        page.evaluate(`fix3p.render = false;`);

        let input = await page.$(".upload input");
        await input.uploadFile(resolve(__dirname, "data/hs224-1.x3p"));
    });

    it("Should be visible", async () => {
        await sleep(1000);

        let el = await page.$(`.view`);
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(true);
    });

    it("Record1 should be visible", async () => {
        await sleep(1000);

        let el = await page.$(`[data-tag="Record1"]`);
        let visible = await el.isIntersectingViewport();
        
        expect(visible).toBe(true);
    });

    it("Clicking the Record2 tab should make Record2 visible", async () => {
        await sleep(1000);
        (await page.$(`div.tab:nth-of-type(2)`)).click();
        
        await sleep(1000);
        let el = await page.$(`[data-tag="Record2"]`);
        let visible = await el.isIntersectingViewport();
        
        expect(visible).toBe(true);
    });

    it("Clicking the Record3 tab should make Record3 visible", async () => {
        await sleep(1000);
        (await page.$(`div.tab:nth-of-type(3)`)).click();

        await sleep(1000);
        let el = await page.$(`[data-tag="Record3"]`);
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(true);
    });

    it("Clicking the Record4 tab should make Record4 visible", async () => {
        await sleep(1000);
        (await page.$(`div.tab:nth-of-type(4)`)).click();

        await sleep(1000);
        let el = await page.$(`[data-tag="Record4"]`);
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(true);
    });

    it("Clicking back to the Record1 tab should make Record1 visible again", async () => {
        await sleep(1000);
        (await page.$(`div.tab:nth-of-type(4)`)).click();

        await sleep(1000);
        (await page.$(`div.tab:nth-of-type(1)`)).click();

        await sleep(1000);
        let el = await page.$(`[data-tag="Record1"]`);
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(true);
    }, 10000);

    it("Should become invisible after clicking the back/close button", async () => {
        await sleep(1000);
        (await page.$(".back")).click();
        
        await sleep(1000);
        let el = await page.$(`.view`);
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(false);
    });

    it("Should disable the stage/render area", () => {
        return page.waitForSelector(".stage[disabled]");
    });
});