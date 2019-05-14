import { getHeaderPart } from "../../src/assets/js/util";

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
});