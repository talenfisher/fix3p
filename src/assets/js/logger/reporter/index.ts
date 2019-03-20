import Item from "../item";

export interface LogReporter {
    report(log: Item[]): Promise<LogReporterResponse>;
}

// minimum reporter response
export interface LogReporterResponse {
    id: number;
    url: string;
}

export { default as KrashReporter } from "./krash-reporter";
export { default as DummyReporter } from "./dummy-reporter";