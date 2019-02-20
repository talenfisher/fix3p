import Stage from "../index";
import { Brush } from "@talenfisher/canvas";
import Editor from "../../editor";
import { rgbToHex } from "../../color";

interface PaintOptions {
    stage: Stage;
    editor: Editor;
}

const DEFAULT_COLOR = "#1f376c";
const DEFAULT_COLOR_RGB = "rgb(31, 55, 108)";

/**
 * Class for handling texture painting
 */
export default class Paint {
    public btn: HTMLElement;
    public undoBtn: HTMLElement;
    public redoBtn: HTMLElement;
    public tray: HTMLElement;
    public annotation: HTMLInputElement;
    public sizeSlider: HTMLInputElement;
    public modeSelector: HTMLSelectElement;
    public color: any = {};
    private stage: Stage;
    private brush?: Brush;
    private editor: Editor;

    private listeners = {
        "mousedown": e => this.dispatch.apply(this, [ e, "begin" ]),
        "mousemove": e => this.dispatch.apply(this, [ e, "move" ]),
        "mouseup": e => this.dispatch.apply(this, [ e, "end" ]),
    };

    /**
     * Paint screen constructor
     * @param options options for setting up painting
     */
    constructor(options: PaintOptions) {
        this.stage = options.stage;
        this.editor = options.editor;
        this.btn = options.stage.el.querySelector(".fa-paint-brush");
        this.tray = options.stage.el.querySelector(".pane-paint-tray");
        this.annotation = options.stage.el.querySelector("#annotation");
        this.sizeSlider = options.stage.el.querySelector("#pane-paint-size");
        this.modeSelector = options.stage.el.querySelector("#pane-paint-mode");
        this.undoBtn = options.stage.el.querySelector("#undo");
        this.redoBtn = options.stage.el.querySelector("#redo");

        let colorEl = options.stage.el.querySelector(".input-color");
        this.color = {
            el: colorEl,
            overlay: colorEl.querySelector(".input-overlay"),
            input: colorEl.querySelector("input"),
        };

        this.setupListeners();
    }

    /**
     * Gets the current file being edited
     */
    public get file() {
        return this.stage.file;
    }

    /**
     * Gets the texture canvas for the current x3p file being edited
     */
    public get canvas() {
        let x3p = this.file;
        return x3p ? x3p.mask.canvas : undefined;
    }

    /**
     * Gets the currently used texture
     */
    public get texture() {
        let x3p = this.file;
        return x3p ? x3p.mask.getTexture() : undefined;
    }

    /**
     * Gets the max brush size for the x3p that is currently being edited
     */
    public get maxBrushSize() {
        let x3p = this.file;
        return x3p ? (x3p.axes.x.size / x3p.axes.y.size) * 100  : 0;
    }

    /**
     * Gets the renderer that is currently in use
     */
    public get renderer() {
        return this.stage.renderer;
    }

    /**
     * Updates the paint object to use the current file
     */
    public update() {
        let canvas = this.canvas;
        let size = this.maxBrushSize * (Number(this.sizeSlider.value) / 100);

        this.brush = canvas ? new Brush({ canvas, size, color: DEFAULT_COLOR, nolisteners: true }) : undefined;
        this.brush.fillPolygons = false;

        this.color.input.value = DEFAULT_COLOR;

        let overlay = this.color.overlay as HTMLElement;
        overlay.style.backgroundColor = DEFAULT_COLOR;
        
        let annotation = this.annotation;
        annotation.value = (this.file && this.file.mask.annotations[DEFAULT_COLOR]) ? this.file.mask.annotations[DEFAULT_COLOR] : "";
        annotation.style.color = DEFAULT_COLOR_RGB;
    }

    /**
     * Sets up event listeners for painting interface elements
     */
    private setupListeners() {

        // the paint button - triggers paint mode on and off
        let btn = this.btn;
        btn.onclick = e => {
            if(!this.renderer) return;

            let active = this.stage.toggleMode("paint");
            this.renderer.mode = active ? "still" : "normal";
            active ? this.attachCanvasListeners() : this.detachCanvasListeners();
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

        // annotation
        this.annotation.onkeyup = e => {
            let annotations = this.file.mask.annotations;
            let color = rgbToHex(this.annotation.style.color);
            let value = this.annotation.value;    
            
            annotations[color] = value;
            this.updateEditorAnnotation(color, value);
        };

        // paint size slider
        this.sizeSlider.onchange = e => {
            if(!this.brush) return;
            this.brush.size = this.maxBrushSize * (Number(this.sizeSlider.value) / 100);
        };

        // mode selector
        this.modeSelector.onchange = e => {
            if(!this.brush) return;
            switch(this.modeSelector.value) {
                case "Paint": 
                    this.brush.fillPolygons = false;
                    this.brush.color = this.color.input.value;
                    break;

                case "Lasso":
                    this.brush.fillPolygons = true;
                    this.brush.color = this.color.input.value;
                    break;
                
                case "Eraser":
                    this.brush.fillPolygons = false;
                    this.brush.color = this.file.manifest.get(`Record3 Mask Background`);
                    break;
            }
        };

        this.undoBtn.onclick = e => {
            if(!this.canvas) return;
            this.canvas.undo();
            this.texture.setPixels(this.canvas.el);
            this.renderer.drawMesh();
        };
        
        this.redoBtn.onclick = e => {
            if(!this.canvas) return;
            this.canvas.redo();
            this.texture.setPixels(this.canvas.el);
            this.renderer.drawMesh();
        };
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

            this.editor.inputify(child, parent);
        }
    }

    private attachCanvasListeners() {
        let canvas = this.stage.canvas;
        for(let listener in this.listeners) {
            canvas.addEventListener(listener, this.listeners[listener]);
        }
    }

    /**
     * Detaches the mouse event handlers on the canvas
     */
    private detachCanvasListeners() {
        let canvas = this.stage.canvas;
        for(let listener in this.listeners) {
            canvas.removeEventListener(listener, this.listeners[listener]);
        }
    }

    /**
     * Event dispatcher - handles mouse events on the canvas and paints
     * accordingly
     * 
     * @param e event parameters
     * @param name the name of the event to dispatch
     */
    private dispatch(e: MouseEvent, name: "begin" | "move" | "end") {
        if(!this.renderer) return;
        
        let rightButtonClicked = e.which === 3 || e.button === 2;
        if(rightButtonClicked) return; 

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