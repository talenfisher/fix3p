import { LogStore } from "./";
import Item from "../item";

export const STORAGE_KEY = "log";

export default class LocalStore implements LogStore {
    write(value: string) {
        localStorage.setItem(STORAGE_KEY, value);
    }

    read(): Item[] {
        try {
            let source = localStorage.getItem(STORAGE_KEY) || "[]";
            let result = JSON.parse(source, (key, value) => {
                return typeof key === "number" ? new Item(value) : value;
            });

            return result.constructor.name === "Array" ? result : [];

        } catch {
            return [];
            
        }
    }
}