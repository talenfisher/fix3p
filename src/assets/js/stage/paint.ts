import Stage from "./";
import { Brush } from "@talenfisher/canvas";

interface PaintOptions {
    stage: Stage;
}

export default class Paint {
    public btn: HTMLElement;
    private stage: Stage;
    private brush?: Brush;

    constructor(options: PaintOptions) {
        this.stage = options.stage;
        this.btn = options.stage.el.querySelector(".fa-paint-brush");
        this.setupListeners();
    }

    public get active() {
        let classList = this.btn.classList;
        return classList.contains("active") && this.file;
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
        this.brush = canvas ? new Brush({ canvas, size: 50, nolisteners: true }) : undefined;
    }

    private setupListeners() {
        let canvas = this.stage.canvas;
        canvas.addEventListener("mousedown", e => this.dispatch.apply(this, [ e, "begin" ]));
        canvas.addEventListener("mousemove", e => this.dispatch.apply(this, [ e, "move" ]));
        canvas.addEventListener("mouseup", e => this.dispatch.apply(this, [ e, "end" ]));

        let btn = this.btn;
        btn.onclick = e => {
            if(!this.renderer) return;
            let classes = btn.classList;
            let renderer = this.renderer;

            classes.toggle("active");
            renderer.mode = classes.contains("active") ? "still" : "normal";
        }
    }

    private dispatch(e, name: "begin" | "move" | "end") {
        if(!this.renderer) return;
        
        let selection = this.renderer.scene.selection;
        if(!this.active || !selection || !selection.data || !this.brush[name]) return;

        // @ts-ignore
        if(name !== "begin" && !this.brush.active) return;
        
        let coords = selection.data.index;
        let args = [ coords[1], coords[0] ];
        let handler = this.brush[name];

        handler.apply(this.brush, args);
        this.texture.setPixels(this.canvas.el);
    }
}