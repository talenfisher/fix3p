import { LogReporter, LogReporterResponse } from ".";
import Item from "../item";

export default class DummyReporter implements LogReporter {
    public response = {
        id: -1,
        url: "http://localhost/"
    };

    async report(log: Item[]): Promise<LogReporterResponse> {
        return this.response;
    }
}