import { url } from "../vars";

describe("Editor (before upload)", () => {
    beforeEach(async () => {
        await page.goto(url);
    });

    it("Should initially be invisible", async () => {
        let el = await page.$("fix3p-editor");
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(false);
    });
});