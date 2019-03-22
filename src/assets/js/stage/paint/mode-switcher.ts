import Session from "../../session";
import Logger from "../../logger";

interface ModeSwitcherOptions {
    el: HTMLSelectElement;
    session: Session;
}

type Mode = "Paint" | "Lasso" | "Eraser";

export default class ModeSwitcher {
    private el: HTMLSelectElement;
    private session: Session;
    
    constructor(options: ModeSwitcherOptions) {
        this.el = options.el;
        this.session = options.session;

        this.setupListeners();
        this.session.on("render", x3p => this.value = "Paint");
    }

    public get value(): Mode {
        return this.el.value as Mode;
    }

    public set value(value: Mode) {
        if(!this.session.started) return;

        this.el.value = value;
        this.updateBrush();
    }

    private setupListeners() {
        this.el.onchange = e => {
            this.session.paintMode = this.value;
            this.updateBrush();
        }
    }

    private updateBrush() {
        if(!this.session.started || !this.session.brush) return;

        let x3p = this.session.x3p;
        let brush = this.session.brush;
        let color = this.session.paintColor;

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

        Logger.action(`annotator mode switched to ${this.value.toLowerCase()}`, this.session.filename);
    }
}