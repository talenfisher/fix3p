
export type ItemType = "warning" | "error" | "action" | "info";

interface ItemOptions {
    type: ItemType;
    message: string;
    filename?: string;
    timestamp?: number;
}

export default class Item {
    public type: ItemType;
    public message: string;
    public filename?: string;
    public timestamp: number;

    constructor(options: ItemOptions) {
        this.type = options.type;
        this.message = options.message;
        this.filename = options.filename;
        this.timestamp = options.timestamp || Date.now();
    }

    toString() {
        let value = `%c${this.type}\n%cMessage: ${this.message}`;

        if(this.filename) {
            value += `\nFile: ${this.filename}`;
        }

        return value;
    }
}