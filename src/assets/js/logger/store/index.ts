import Item from "../item";

export interface LogStore {
    write(value: string): void;
    read(): Item[];
}

export { default as LocalStore } from "./local-store";
export { default as StringStore } from "./string-store";