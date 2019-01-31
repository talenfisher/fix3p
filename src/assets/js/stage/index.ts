import { X3P, Renderer } from "x3p.js";
import Paint from "./paint";

const $file = Symbol();

export interface StageOptions {
    el: HTMLElement;
}

export type MODES = "normal" | "paint";

export default class Stage {
    public el: HTMLElement;
    public canvas: HTMLCanvasElement;
    public renderer: Renderer;

    private fullscreenBtn: HTMLElement;
    private paintBtn: HTMLElement;
    private paint: Paint;
    private [$file]?: X3P;

    constructor(options: StageOptions) {
        this.el = options.el;
        this.canvas = this.el.querySelector("canvas");
        this.paint = new Paint({ stage: this });

        this.setupFullscreenBtn();
    }

    public get enabled() {
        return !this.el.hasAttribute("disabled");
    }

    public set enabled(enabled: boolean) {
        enabled ? this.el.removeAttribute("disabled") : this.el.setAttribute("disabled", "disabled");
    }

    public get mode() {
        return this.el.getAttribute("data-mode");
    }

    public set mode(value: string) {
        this.el.setAttribute("data-mode", value);
    }

    public get file() {
        return this[$file];
    }

    public set file(x3p: X3P) {
        this[$file] = x3p;
        this.renderer = x3p.render(this.canvas);
        this.paint.update();
    }

    public toggleMode(mode: MODES) {
        let currentMode = this.mode;
        let newMode = currentMode === mode ? "normal" : mode;
        this.mode = newMode;
        return newMode === mode;
    }

    public clear() {
        if(this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        if(this[$file]) {
            this[$file] = null;
        }

        let paintBtn = this.paint.btn;
        paintBtn.classList.remove("active");
    }

    private setupFullscreenBtn() {
        let btn = this.fullscreenBtn = this.el.querySelector(".fa-expand");
        
        btn.onclick = (e) => {
            if(!this.enabled) return;
            document.fullscreenElement === null ? this.el.requestFullscreen() : document.exitFullscreen();
        };

        document.onfullscreenchange = (e) => {
            document.fullscreenElement === null ? btn.classList.remove("active") : btn.classList.add("active");
        }
    }
}