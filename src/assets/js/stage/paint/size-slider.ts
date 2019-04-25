import Session from "../../session";
import Logger from "../../logger";
import { CustomElement } from "../../decorators";

@CustomElement
export default class SizeSlider extends HTMLElement {
    private input: HTMLInputElement;

    connectedCallback() {
        this.input = this.querySelector("input");
        this.setupListeners();
        Session.on("render", this.reset.bind(this));
    }

    public reset() {
        if(!Session.started) return;

        this.value = 0.15;
        this.updateBrushSize();
    }
    
    public get value() {
        // range inputs don't work with decimals, otherwise
        // I would just use 0/1 min/max attrs on the range element
        return (Number(this.input.value) / 100);
    }

    public set value(value: number) {
        if(!Session.started || value < 0 || value > 1) return;
        this.input.value = (value * 100).toString();
    }

    public get maxBrushSize() {
        if(!Session.started) return 0;

        let { x, y } = Session.x3p.axes;
        return ((x.size as number) / (y.size as number)) * 100;
    }

    private setupListeners() {
        this.input.onchange = this.updateBrushSize.bind(this);
    }

    private updateBrushSize() {
        if(!Session.started) return;

        let brush = Session.brush;
        brush.size = this.value * this.maxBrushSize;
        Logger.action(`brush size changed to ${brush.size}`, Session.filename);
    }
}