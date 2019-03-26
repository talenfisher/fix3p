import Session from "../../session";
import Logger from "../../logger";
import { CustomElement } from "../../decorators";
import { DEFAULT_COLOR } from "./";

interface ColorSwitcherOptions {
    el: HTMLElement;
    defaultColor: string;
}

@CustomElement
export default class ColorSwitcher extends HTMLElement {
    private overlay: HTMLElement;
    private input: HTMLInputElement;

    connectedCallback(options: ColorSwitcherOptions) {
        this.overlay = this.querySelector(".input-overlay");
        this.input = this.querySelector("input");

        this.setupListeners();
        Session.on("start", this.reset.bind(this));
    }

    public get value() {
        return this.input.value;
    }

    private reset() {
        this.input.value = DEFAULT_COLOR;
        this.overlay.style.backgroundColor = DEFAULT_COLOR;
    }

    private setupListeners() {
        this.input.onchange = e => {
            if(!Session.started) return;
            
            let color = this.input.value;

            Session.paintColor = color;
            this.overlay.style.backgroundColor = color;
            Logger.action(`switched color to ${color}`, Session.filename);
        }
    }
}