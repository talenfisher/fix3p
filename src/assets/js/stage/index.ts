import { X3P, Renderer } from "x3p.js";
import Paint from "./paint/index";
import Editor from "../editor";
import Session from "../session";

export interface StageOptions {
    el: HTMLElement;
    editor: Editor;
    session: Session;
}

export type MODES = "normal" | "paint";

export default class Stage {
    public el: HTMLElement;
    public canvas: HTMLCanvasElement;
    public renderer: Renderer;
    public paint: Paint;

    private session: Session;
    private fullscreenBtn: HTMLElement;

    constructor(options: StageOptions) {
        this.session = options.session;
        this.el = options.el;
        this.canvas = this.el.querySelector("canvas");
        this.paint = new Paint({ 
            stage: this, 
            editor: options.editor, 
            session: this.session 
        });

        this.setupFullscreenBtn();

        this.session.on("start", this.render.bind(this));
        this.session.on("end", this.reset.bind(this));
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

    public toggleMode(mode: MODES) {
        let currentMode = this.mode;
        let newMode = currentMode === mode ? "normal" : mode;
        this.mode = newMode;
        return newMode === mode;
    }

    public reset() {
        this.mode = "normal";
    }

    private render(x3p) {
        if(!this.enabled || !this.session.started || !this.session.x3p) return;
        this.session.renderer = x3p.render(this.canvas);
    }

    private setupFullscreenBtn() {
        let btn = this.fullscreenBtn = this.el.querySelector(".fa-expand");
        
        btn.onclick = (e) => {
            if(!this.enabled || !this.session.started) return;
            document.fullscreenElement === null ? this.el.requestFullscreen() : document.exitFullscreen();
        };

        document.onfullscreenchange = (e) => {
            document.fullscreenElement === null ? btn.classList.remove("active") : btn.classList.add("active");
        }
    }
}