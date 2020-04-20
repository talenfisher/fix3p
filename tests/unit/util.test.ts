import { getHeaderPart, getX3pAnnotationColors } from "../../src/assets/js/util";
import Color from "@talenfisher/color";
import X3P from "x3p.js";

describe("util", () => {
    describe("getHeaderPart", () => {
        it("Should return a header part's value if its present", () => {
            let header = 'attachment; filename="test.jpg"';
            let filename = getHeaderPart(header, "filename");
            expect(filename).toBe("test.jpg");
        });

        it("Should return null if the header part is not present", () => {
            let header = 'attachment; filename="test.jpg"';
            let name = getHeaderPart(header, "name");
            expect(name).toBeNull();
        });
    });

    describe("getX3pAnnotationColors", () => {
        it("Should return an array of colors including annotation colors and read colors", () => {
            const annotations = { ["#ff0000"]: 'red value', ["#0000ff"]: 'blue value' };
            const colors = [ new Color("#00ff00") ];
            const mask = { annotations, colors };
            const x3p = { mask } as any;

            const actual = getX3pAnnotationColors(x3p);
            expect(actual).toEqual(["#ff0000", "#0000ff", "#00ff00"]);
        });
        
        it("Should exclude the background color", () => {
            const annotations = { ["#ff0000"]: 'red value', ["#0000ff"]: 'blue value' };
            const colors = [ new Color("#00ff00") ];
            const background = "#ff0000";
            const mask = { annotations, colors, color: background };
            const x3p = { mask } as any;

            const actual = getX3pAnnotationColors(x3p);
            expect(actual).toEqual(["#0000ff", "#00ff00"]);
        });
    });
});