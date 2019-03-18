import Session from "../../session";
import Logger from "../../logger";

interface ColorSwitcherOptions {
    session: Session;
    el: HTMLElement;
    defaultColor: string;
}

export default class ColorSwitcher {
    private session: Session;
    private el: HTMLElement;
    private overlay: HTMLElement;
    private input: HTMLInputElement;
    private defaultColor: string;

    public constructor(options: ColorSwitcherOptions) {
        this.session = options.session;
        this.defaultColor = options.defaultColor;
        this.el = options.el;
        this.overlay = this.el.querySelector(".input-overlay");
        this.input = this.el.querySelector("input");

        this.setupListeners();
        this.session.on("start", this.reset.bind(this));
    }

    public get value() {
        return this.input.value;
    }

    private reset() {
        this.input.value = this.defaultColor;
        this.overlay.style.backgroundColor = this.defaultColor;
    }

    private setupListeners() {
        this.input.onchange = e => {
            if(!this.session.started) return;
            
            let color = this.input.value;

            this.session.paintColor = color;
            this.overlay.style.backgroundColor = color;
            Logger.action(`switched color to ${color}`, this.session.filename);
        }
    }
}