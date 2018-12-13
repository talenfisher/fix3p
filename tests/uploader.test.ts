import { resolve } from "path";
import { promisify } from "util";

const sleep = promisify(setTimeout);

describe("Uploader", () => {
    var input;

    beforeEach(async () => {
        await page.goto("http://localhost:8080/index.html");
        page.evaluate(`fix3p.render = false;`);
        input = await page.$(".upload input");
    });

    it("Should be visible", async () => {
        let el = await page.$(".upload");
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(true);
    });

    it("Should shift to editor view when supplied a valid X3P file", async () => {
        input.uploadFile(resolve(__dirname, "data/hs224-1.x3p"));
        await sleep(1000);

        let editor = await page.$(".view");
        let visible = await editor.isIntersectingViewport();

        expect(visible).toBe(true);
    });

    it("Should display an error when supplied a non-X3P file", async () => {
        input.uploadFile(resolve(__dirname, "data/fake.txt"));

        let error = await page.waitForSelector(`.upload-error`);
        let visible = await error.isIntersectingViewport();

        expect(visible).toBe(true);
    });

    it("Should become visible again after closing the editor", async () => {
        await input.uploadFile(resolve(__dirname, "data/hs224-1.x3p"));
        await sleep(1000);
        
        (await page.$(".back")).click();
        await sleep(1000);
        
        let el = await page.$(".upload");
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(true);
    });
});