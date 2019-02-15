import Stage from "./";
import { Brush } from "@talenfisher/canvas";
import Editor from "../editor";

interface PaintOptions {
    stage: Stage;
    editor: Editor;
}

const DEFAULT_COLOR = "#1f376c";
const DEFAULT_COLOR_RGB = "rgb(31, 55, 108)";

export default class Paint {
    public btn: HTMLElement;
    public tray: HTMLElement;
    public annotation: HTMLInputElement;
    public color: any = {};
    private stage: Stage;
    private brush?: Brush;
    private editor: Editor;

    private listeners = {
        "mousedown": e => this.dispatch.apply(this, [ e, "begin" ]),
        "mousemove": e => this.dispatch.apply(this, [ e, "move" ]),
        "mouseup": e => this.dispatch.apply(this, [ e, "end" ]),
    };

    constructor(options: PaintOptions) {
        this.stage = options.stage;
        this.editor = options.editor;
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
        this.color.input = DEFAULT_COLOR;

        let overlay = this.color.overlay as HTMLElement;
        overlay.style.backgroundColor = DEFAULT_COLOR;
        
        let annotation = this.annotation;
        annotation.value = (this.file && this.file.mask.annotations[DEFAULT_COLOR]) ? this.file.mask.annotations[DEFAULT_COLOR] : "";
        annotation.style.color = DEFAULT_COLOR_RGB;
    }

    private setupListeners() {
        let btn = this.btn;
        btn.onclick = e => {
            if(!this.renderer) return;

            let active = this.stage.toggleMode("paint");
            this.renderer.mode = active ? "still" : "normal";
            active ? this.attachListeners() : this.detachListeners();
        }

        // color picker
        let input = this.color.input;
        let overlay = this.color.overlay;
        input.value = DEFAULT_COLOR;
        input.onchange = e => {
            this.brush.color = input.value;
            overlay.style.backgroundColor = input.value;
            
            this.annotation.style.color = input.value;
            this.annotation.value = this.file.mask.annotations[input.value] || "";
        }

        this.annotation.onkeyup = e => {
            let annotations = this.file.mask.annotations;
            let color = this.rgbToHex(this.annotation.style.color);
            let value = this.annotation.value;    
            
            annotations[color] = value;
            this.updateEditorAnnotation(color, value);
        }
    }

    private updateEditorAnnotation(color: string, value: any) {
        let editorEl = document.querySelector(`[data-tag="Annotation"][data-color="${color}"] input`) as HTMLInputElement | null;
            
        if(editorEl) {
            editorEl.value = value;
        } else {
            let parent = document.querySelector(`[data-tag="Annotations"]`);
            let child = { children: [ this.file.manifest.getNode(`Annotation[color="${color}"]`) ] };

            if(!parent) {
                let maskEl = document.querySelector(`[data-tag="Mask"]`);
                if(!maskEl) return;

                child = { children: [ this.file.manifest.getNode("Record3 Mask Annotations") ] };
                parent = maskEl;
            } 

            this.editor.generateIterator(child, parent);
        }
    }

    private rgbToHex(rgb) {
        let color = "#";
        rgb = rgb.replace("rgb(", "");
        rgb = rgb.replace(")", "");
        
        for(let component of rgb.split(",")) {
            component = component.trim();
            color += Number(component).toString(16);
        }

        return color;
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