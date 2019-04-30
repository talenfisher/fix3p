import Session from "../../session";
import Logger from "../../logger";
import { CustomElement } from "../../decorators";

export type HistoryButtonType = "undo" | "redo";

@CustomElement("historybutton")
export default class HistoryButton extends HTMLElement {
    connectedCallback() {
        this.validateType(this.type);
        this.setupListeners();
    }

    get type() {
        return this.getAttribute("type") as HistoryButtonType;
    }

    set type(value: "undo" | "redo") {
        this.validateType(value);
        this.setAttribute("type", value);
    }

    private validateType(type: string) {
        if(![ "undo", "redo" ].includes(this.type)) {
            throw new Error("fix3p-historybutton must have a type equal to undo or redo");
        }
    }

    private setupListeners() {
        this.onclick = e => {
            if(!Session.started) return;

            let canvas = Session.x3p.mask.canvas;
            let texture = Session.texture;
            let renderer = Session.renderer;

            canvas[this.type]();
            texture.setPixels(canvas.el);
            renderer.drawMesh();
            Logger.action(`attempted ${this.type}`, Session.filename);
        };
    }
}