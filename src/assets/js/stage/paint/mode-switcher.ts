import Session from "../../session";
import Logger from "../../logger";
import { CustomElement } from "../../decorators";

interface ModeSwitcherOptions {
    el: HTMLSelectElement;
}

type Mode = "Paint" | "Lasso" | "Eraser";

@CustomElement
export default class ModeSwitcher extends HTMLElement {
    private select: HTMLSelectElement;
    
    connectedCallback() {
        this.select = this.querySelector("select");
        this.setupListeners();
        Session.on("render", x3p => this.value = "Paint");
    }

    public get value(): Mode {
        return this.select.value as Mode;
    }

    public set value(value: Mode) {
        if(!Session.started) return;

        this.select.value = value;
        this.updateBrush();
    }

    private setupListeners() {
        this.select.onchange = e => {
            Session.paintMode = this.value;
            this.updateBrush();
        }
    }

    private updateBrush() {
        if(!Session.started || !Session.brush) return;

        let x3p = Session.x3p;
        let brush = Session.brush;
        let color = Session.paintColor;

        switch(this.value) {
            case "Paint": 
                brush.fillPolygons = false;
                brush.color = color;
                break;

            case "Lasso":
                brush.fillPolygons = true;
                brush.color = color;
                break;
            
            case "Eraser":
                brush.fillPolygons = false;
                brush.color = x3p.manifest.get(`Record3 Mask Background`);
                break;
        }

        Logger.action(`annotator mode switched to ${this.value.toLowerCase()}`, Session.filename);
    }
}