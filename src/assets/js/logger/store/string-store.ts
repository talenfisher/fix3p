import { LogStore } from "./";
import Item from "../item";

const $store = Symbol();

export default class StringStore implements LogStore {
    private [$store]: string = "[]";

    public write(value: string) {
        this[$store] = value;
    }

    public read(): Item[] {
        return JSON.parse(this[$store], (key, value) => {
            return typeof key === "number" ? new Item(value) : value;
        });
    }
}