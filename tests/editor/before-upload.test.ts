describe("Editor (before upload)", () => {
    beforeEach(async () => {
        await page.goto("http://localhost:1432/index.html");
    });

    it("Should initially be invisible", async () => {
        let el = await page.$(".view");
        let visible = await el.isIntersectingViewport();

        expect(visible).toBe(false);
    });
});