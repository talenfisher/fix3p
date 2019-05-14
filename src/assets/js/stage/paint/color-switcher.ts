import Session from "../../session";
import Logger from "../../logger";
import { CustomElement } from "../../decorators";
import { DEFAULT_COLOR } from "./";
import { rgbToHex } from "../../color";

interface ColorSwitcherOptions {
    el: HTMLElement;
    defaultColor: string;
}

@CustomElement("colorswitcher")
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
        return rgbToHex(this.input.value);
    }

    public set value(value: string) {
        this.input.value = value;
        this.input.dispatchEvent(new Event("change"));
    }

    private reset() {
        this.input.value = DEFAULT_COLOR;
        this.overlay.style.backgroundColor = DEFAULT_COLOR;
    }

    private setupListeners() {
        this.input.onchange = e => {
            if(!Session.started) return;
            
            let color = this.value;

            Session.paintColor = rgbToHex(color);
            this.overlay.style.backgroundColor = color;
            Logger.action(`switched color to ${color}`, Session.filename);
        }
    }
}