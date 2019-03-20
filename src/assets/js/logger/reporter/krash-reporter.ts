import { LogReporter, LogReporterResponse } from ".";
import Item from "../item";
import axios from "axios";

const KRASH_REPORT_URL = "https://krash.vila.cythral.com/report";

declare var fix3p;

export default class KrashReporter implements LogReporter {
    async report(log: Item[]): Promise<LogReporterResponse> {
        let xhrResponse = await axios.post(
            KRASH_REPORT_URL, 
            {
                repo: "fix3p",
                log,
                version: fix3p.version,
            },
            {
                validateStatus: status => status === 200,
            }
        );

        if(!("id" in xhrResponse.data) || !("url" in xhrResponse.data)) {
            throw new Error("Received invalid response from Krash.");
        }
        
        return {
            id: xhrResponse.data.id,
            url: xhrResponse.data.url,
        };
    }
}