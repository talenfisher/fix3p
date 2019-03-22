import { resolve } from "path";
import { readdirSync } from "fs";
import { url } from "../vars";

for(let file of readdirSync(resolve(__dirname, "../data/bad/"))) {
    describe(`Uploader <${file}> (bad)`, () => {
        var input;

        beforeEach(async () => {
            await page.goto(url);
            page.evaluate(`fix3p.render = false;`);
            input = await page.$(".upload input");
        });

        if(!file.match(/\.x3p$/g) || file.match(/\[nu\]/g)) {
            it("Should display an error when supplied a file that isn't an X3P", async () => {
                input.uploadFile(resolve(__dirname, "../data/bad/"+file));

                let error = await page.waitForSelector(`.upload-error`);
                let visible = await error.isIntersectingViewport();

                expect(visible).toBe(true);
            });
        }
    });
}