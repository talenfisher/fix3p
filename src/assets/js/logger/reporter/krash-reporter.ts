import { LogReporter, LogReporterResponse } from ".";
import Item from "../item";
import axios from "axios";
import { throws } from "../../decorators";

const KRASH_REPORT_URL = "https://krash.vila.cythral.com/report";

declare var fix3p;

export default class KrashReporter implements LogReporter {

    @throws({ message: "An error occurred while attempting to upload a crash report." })
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
        
        let data = xhrResponse.data;
        if(!("id" in data) || !("url" in data)) {
            throw new Error("Received invalid response from Krash.");
        }
        
        return {
            id: data.id,
            url: data.url,
        };
    }
}