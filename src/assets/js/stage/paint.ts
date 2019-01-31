import Stage from "./";
import { Brush } from "@talenfisher/canvas";

interface PaintOptions {
    stage: Stage;
}

const DEFAULT_COLOR = "#1f376c";

export default class Paint {
    public btn: HTMLElement;
    public tray: HTMLElement;
    public annotation: HTMLInputElement;
    public color: any = {};
    private stage: Stage;
    private brush?: Brush;

    private listeners = {
        "mousedown": e => this.dispatch.apply(this, [ e, "begin" ]),
        "mousemove": e => this.dispatch.apply(this, [ e, "move" ]),
        "mouseup": e => this.dispatch.apply(this, [ e, "end" ]),
    };

    constructor(options: PaintOptions) {
        this.stage = options.stage;
        this.btn = options.stage.el.querySelector(".fa-paint-brush");
        this.tray = options.stage.el.querySelector(".pane-paint-tray");
        this.annotation = options.stage.el.querySelector("#annotation");

        let colorEl = options.stage.el.querySelector(".input-color");
        this.color = {
            el: colorEl,
            overlay: colorEl.querySelector(".input-overlay"),
            input: colorEl.querySelector("input"),
        };

        this.setupListeners();
    }

    public get active() {
        return typeof this.file !== "undefined";
    }

    public get file() {
        return this.stage.file;
    }

    public get canvas() {
        let x3p = this.file;
        return x3p ? x3p.mask.canvas : undefined;
    }

    public get context() {
        let canvas = this.canvas;
        return canvas ? canvas.context : undefined;
    }

    public get texture() {
        let x3p = this.file;
        return x3p ? x3p.mask.getTexture() : undefined;
    }

    public get renderer() {
        return this.stage.renderer;
    }

    public update() {
        let canvas = this.canvas;
        this.brush = canvas ? new Brush({ canvas, size: 50, color: DEFAULT_COLOR, nolisteners: true }) : undefined;
        
        let overlay = this.color.overlay as HTMLElement;
        overlay.style.backgroundColor = DEFAULT_COLOR;
    }

    private setupListeners() {
        let btn = this.btn;
        btn.onclick = e => {
            if(!this.renderer) return;

            let active = this.stage.toggleMode("paint");
            this.renderer.mode = active ? "still" : "normal";
            active ? this.attachListeners() : this.detachListeners();
        }

        let input = this.color.input;
        let overlay = this.color.overlay;
        input.value = DEFAULT_COLOR;
        input.onchange = e => {
            this.brush.color = input.value;
            overlay.style.backgroundColor = input.value;
            
            this.annotation.style.backgroundColor = input.value;
            this.annotation.value = this.file.mask.annotations[input.value] || "";
        }
    }

    private attachListeners() {
        let canvas = this.stage.canvas;
        for(let listener in this.listeners) {
            canvas.addEventListener(listener, this.listeners[listener]);
        }
    }

    private detachListeners() {
        let canvas = this.stage.canvas;
        for(let listener in this.listeners) {
            canvas.removeEventListener(listener, this.listeners[listener]);
        }
    }

    private dispatch(e, name: "begin" | "move" | "end") {
        if(!this.renderer) return;
        
        let rightButton = e.which === 3 || e.button === 2;
        if(rightButton) return; 

        let selection = this.renderer.selection;
        if(!selection || !this.brush[name]) return;

        // @ts-ignore
        if(name !== "begin" && !this.brush.active) return;
        
        let coords = selection.index;
        let args = [ coords[1], coords[0] ];
        let handler = this.brush[name];

        handler.apply(this.brush, args);
        this.texture.setPixels(this.canvas.el);
        this.renderer.drawMesh();
    }
}