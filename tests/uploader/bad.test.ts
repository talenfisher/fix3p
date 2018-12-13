import { resolve } from "path";
import { promisify } from "util";
import { readdirSync } from "fs";

const sleep = promisify(setTimeout);

for(let file of readdirSync(resolve(__dirname, "../data/bad/"))) {
    describe(`Uploader <${file}> (bad)`, () => {
        var input;

        beforeEach(async () => {
            await page.goto("http://localhost:8080/index.html");
            page.evaluate(`fix3p.render = false;`);
            input = await page.$(".upload input");
        });


        it("Should display an error when supplied an invalid X3P file", async () => {
            input.uploadFile(resolve(__dirname, "../data/bad/"+file));

            let error = await page.waitForSelector(`.upload-error`);
            let visible = await error.isIntersectingViewport();

            expect(visible).toBe(true);
        });
    });
}