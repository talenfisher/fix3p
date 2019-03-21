import Logger from "../../src/assets/js/logger";
import Item from "../../src/assets/js/logger/item";
import StringStore from "../../src/assets/js/logger/store/string-store";
import DummyReporter from "../../src/assets/js/logger/reporter/dummy-reporter";

describe("Logger", () => {
    beforeEach(() => {
        Logger.clear();
        Logger.writeToConsole = false;
        Logger.store = new StringStore();
        Logger.reporter = new DummyReporter();
    });

    describe("get", () => {
        it("should initially return an empty array", () => {
            let result = Logger.get();
            expect(result.length).toBe(0);
        });

        it("should not throw an error when given a count greater than the log length", () => {
            let result = Logger.get(5);
            expect(result.length).toBe(0);
        });

        it("should return an array of items after calling log", () => {
            Logger.log("action", "test log");
            let result = Logger.get();
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(1);
            expect(result[0]).toBeInstanceOf(Item);
        });
    });

    describe("warn", () => {
        it("should log an item with type='warning'", () => {
            Logger.warn("test warning");
            let result = Logger.get(1)[0];
            expect(result.type).toBe("warning");
        });
    });

    describe("info", () => {
        it("should log an item with type='info'", () => {
            Logger.info("test info");
            let result = Logger.get(1)[0];
            expect(result.type).toBe("info");
        });
    });

    describe("error", () => {
        it("should log an item with type='error'", () => {
            Logger.error("test error");
            let result = Logger.get(1)[0];
            expect(result.type).toBe("error");
        });
    });

    describe("action", () => {
        it("should log an item with type='action'", () => {
            Logger.action("test action");
            let result = Logger.get(1)[0];
            expect(result.type).toBe("action");
        });
    });

    describe("report", () => {
        it("should return null when no reporter is set", async () => {
            Logger.reporter = null;
            let report = await Logger.report();
            expect(report).toBe(null);
        });

        it("should return an object with an id and url when a reporter is set", async () => {
            let report = await Logger.report();
            expect(typeof report.id).toBe("number");
            expect(typeof report.url).toBe("string");
        });
    });
});