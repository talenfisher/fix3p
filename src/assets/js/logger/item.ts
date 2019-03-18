
export type ItemType = "warning" | "error" | "action" | "info";

interface ItemOptions {
    type: ItemType;
    message: string;
    filename?: string;
}

export default class Item {
    private type: ItemType;
    private message: string;
    private filename?: string;
    private timestamp: number = Date.now();

    constructor(options: ItemOptions) {
        this.type = options.type;
        this.message = options.message;
        this.filename = options.filename;
    }

    toString() {
        let value = `%c${this.type}\n%cMessage: ${this.message}`;

        if(this.filename) {
            value += `\nFile: ${this.filename}`;
        }

        return value;
    }
}