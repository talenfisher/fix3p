import Item, { ItemType } from "./item";
import { LogStore } from "./store";
import { LogReporter, LogReporterResponse } from "./reporter";

export const TYPE_MAP = {
    "info": console.info,
    "action": console.log,
    "error": console.error,
    "warning": console.warn,
};
export const COLOR_MAP = {
    "info": "#000000",
    "action": "#0000FF",
    "error": "#8B0000",
    "warning": "#FF0000",
};

const $log = Symbol();
const $store = Symbol();
const $reporter = Symbol();

export default class Logger {
    public static writeToConsole: boolean = true;

    private static [$store]?: LogStore;
    private static [$reporter]?: LogReporter;
    private static [$log]: Item[] = [];

    public static set store(store: LogStore) {
        Logger[$store] = store;
        Logger.load();
    }

    public static get store() {
        return Logger[$store];
    }

    public static set reporter(reporter: LogReporter) {
        Logger[$reporter] = reporter;
    }

    public static get reporter() {
        return Logger[$reporter];
    }

    public static save() {
        if(!Logger[$store]) return;
        Logger[$store].write(Logger.toString());
    }

    public static clear() {
        Logger[$log] = [];
        Logger.save();
    }

    public static log(type: ItemType, message: string, filename?: string) {
        let item = new Item({ type, message, filename });
        Logger[$log].push(item);
        Logger.save();
        Logger.output(item);
    }

    public static load() {
        Logger[$log] = Logger[$store].read();
    }

    public static get(count: number = Logger[$log].length): Item[] {
        count = Math.min(count, Logger[$log].length);
        return Logger[$log].slice(-count);
    }

    public static get count(): number {
        return Logger[$log].length;
    }

    public static warn(message: string, filename?: string) {
        Logger.log("warning", message, filename);
    }

    public static error(message: string, filename?: string) {
        Logger.log("error", message, filename);
    }

    public static action(message: string, filename?: string) {
        Logger.log("action", message, filename);
    }

    public static info(message: string, filename?: string) {
        Logger.log("info", message, filename);
    }

    public static async report(): Promise<LogReporterResponse | null> {
        return Logger.reporter ? Logger.reporter.report(Logger[$log]) : null;
    }

    public static toString() {
        return JSON.stringify(Logger[$log]);
    }

    private static output(item: Item) {
        if(!Logger.writeToConsole) return;

        let output = item.toString();
        let action = TYPE_MAP[item.type] || console.log;
        let color = COLOR_MAP[item.type] || "black";
        action(output, `color: ${color}; font-weight: bold; font-size: 1.1em;`, "");
    }
}

export * from "./store";
export * from "./reporter";