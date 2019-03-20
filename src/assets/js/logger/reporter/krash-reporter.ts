import { LogReporter, LogReporterResponse } from ".";
import Item from "../item";
import axios from "axios";

const KRASH_REPORT_URL = "https://krash.vila.cythral.com/report";

export default class KrashReporter implements LogReporter {
    async report(log: Item[]): Promise<LogReporterResponse> {
        let xhrResponse = await axios.post(KRASH_REPORT_URL, {
            repo: "fix3p",
            log,
            version: document.querySelector(`meta[name="fix3p.version"]`).getAttribute("value"),
        });

        if(!("id" in xhrResponse.data) || !("url" in xhrResponse.data)) {
            throw new Error("Received invalid response from Krash.");
        }
        
        return {
            id: xhrResponse.data.id,
            url: xhrResponse.data.url,
        };
    }
}