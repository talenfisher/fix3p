import { settings_url } from "../vars";

var slider = {
    track: {
        width: 0,
    },

    thumb: {
        left: 0,
        top: 0,
    },
};

function mouseLine(mouse, prev: number[], next: number[]) {
    if(prev.length !== 2 || next.length !== 2) return;
    
    mouse.move(prev[0], prev[1]);
    mouse.down();
    mouse.move(next[0], next[1]);
    mouse.up();
}

async function getDecimationValue(page) {
    return Number(await page.evaluate(`localStorage.getItem("decimation")`));
}

describe("Decimation Slider", () => {
    beforeEach(async () => {
        await page.setViewport({ height: 1920, width: 1040 });
        await page.goto(settings_url);
        
        // get thumb variables
        slider.thumb = await page.evaluate((thumb) => {
            let box = thumb.getBoundingClientRect();
            return {
                top: box.top + 5,
                left: box.left + 3,
            };
        }, await page.$("#decimation .slider-thumb"));

        // get track variables
        slider.track.width = await page.evaluate(`document.querySelector("#decimation").width`) - 3;
    });

    afterEach(async () => {
        await page.evaluate(`localStorage.clear()`);
    });

    it("Should initially be set to 0", async () => {
        let value = await page.evaluate(`document.querySelector("#decimation").value`);
        expect(value).toBe(0);
    });

    it("Click and drag should update the decimation factor", async () => {
        let value = 0.4;
        let ox = slider.thumb.left;
        let oy = slider.thumb.top;
        let nx = (value * slider.track.width) + ox;
        let ny = oy;

        mouseLine(page.mouse, [ ox, oy ], [ nx, ny ]);

        let result = await getDecimationValue(page);
        let diff = result - value;
        expect(diff).toBeLessThan(0.1); // allow 0.1 margin of error
    });

    it("Should be clamped with an upper bound of 1", async () => {
        let ox = slider.thumb.left;
        let oy = slider.thumb.top;
        let nx = slider.track.width + 30 + ox;
        let ny = oy;

        mouseLine(page.mouse, [ ox, oy ], [ nx, ny ]);
        let result = await getDecimationValue(page);
        expect(result).toBe(1);
    });

    it("Should be clamped with a lower bound of 0", async () => {
        let ox = slider.thumb.left;
        let oy = slider.thumb.top;
        let nx = ox - slider.track.width;
        let ny = oy;

        mouseLine(page.mouse, [ ox, oy ], [ nx, ny ]);
        let result = await getDecimationValue(page);
        let diff = result - 0;
        expect(diff).toBeLessThan(0.1);
        expect(diff).toBeGreaterThanOrEqual(0);
    });
});