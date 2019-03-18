import Item, { ItemType } from "./item";

const TYPE_MAP = {
    "action": console.log,
    "error": console.error,
    "warning": console.warn,
};


export default class Logger {
    private static _log: Item[] = [];

    constructor() {
        // placeholder
    }

    static log(type: ItemType, message: string, filename?: string) {
        let item = new Item({ type, message, filename });
        Logger._log.push(item);
        
        let output = item.toString();
        let action = TYPE_MAP[type] || console.log;
        let color = type === "action" ? "blue" : "red";
        action(output, `color: ${color}; font-weight: bold; font-size: 1.1em;`, "");
    }

    static warn(message: string, filename?: string) {
        Logger.log("warning", message, filename);
    }

    static error(message: string, filename?: string) {
        Logger.log("error", message, filename);
    }

    static action(message: string, filename?: string) {
        Logger.log("action", message, filename);
    }
}