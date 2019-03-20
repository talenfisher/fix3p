import { LogReporter, LogReporterResponse } from ".";
import Item from "../item";

export default class DummyReporter implements LogReporter {
    async report(log: Item[]): Promise<LogReporterResponse> {
        return {
            id: -1,
            url: "http://localhost/"
        }
    }
}