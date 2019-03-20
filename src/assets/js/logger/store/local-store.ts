import { LogStore } from "./";
import Item from "../item";

export const STORAGE_KEY = "log";

export default class LocalStore implements LogStore {
    write(value: string) {
        localStorage.setItem(STORAGE_KEY, value);
    }

    read(): Item[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEY), (key, value) => {
            return typeof key === "number" ? new Item(value) : value;
        });
    }
}