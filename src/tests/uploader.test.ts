import { resolve } from "path";

describe("Uploader", () => {
    var input;

    beforeEach(async () => {
        await page.goto("http://localhost:8080/index.html");
        input = await page.$(".upload input");
    });

    it("Should shift to editor view when supplied a valid X3P file", async () => {
        input.uploadFile(resolve(__dirname, "data/hs224-1.x3p"));

        return await page.waitForSelector(`form[data-view="editor"]`);
    });

    it("Should display an error when supplied a non-X3P file", async () => {
        input.uploadFile(resolve(__dirname, "data/fake.txt"));

        return await page.waitForSelector(`.upload-error`);
    });
});