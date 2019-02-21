import Stage from "../index";
import { Brush } from "@talenfisher/canvas";
import Editor from "../../editor";
import Session from "../../session";
import X3P from "x3p.js";
import ColorSwitcher from "./color-switcher";
import ModeSwitcher from "./mode-switcher";
import HistoryButton from "./history-button";
import AnnotationInput from "./annotation-input";
import SizeSlider from "./size-slider";

interface PaintOptions {
    stage: Stage;
    editor: Editor;
    session: Session;
}

const DEFAULT_COLOR = "#1f376c";
const DEFAULT_COLOR_RGB = "rgb(31, 55, 108)";

/**
 * Class for handling texture painting
 */
export default class Paint {
    public btn: HTMLElement;
    public tray: HTMLElement;
    public color: any = {};

    private file?: X3P;
    private session: Session;
    private stage: Stage;
    private brush?: Brush;
    private editor: Editor;

    public readonly colorSwitcher: ColorSwitcher;
    public readonly modeSwitcher: ModeSwitcher;
    public readonly undoButton: HistoryButton;
    public readonly redoButton: HistoryButton;
    public readonly annotationInput: AnnotationInput;
    public readonly sizeSlider: SizeSlider;

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
        this.session = options.session;
        this.stage = options.stage;
        this.editor = options.editor;

        let stage = options.stage.el;
        this.btn = stage.querySelector(".fa-paint-brush");
        this.tray = stage.querySelector(".pane-paint-tray");
        
        this.colorSwitcher = new ColorSwitcher({
            session: this.session,
            el: stage.querySelector(".input-color"),
            defaultColor: DEFAULT_COLOR,
        });

        this.modeSwitcher = new ModeSwitcher({
            session: this.session,
            el: stage.querySelector("#pane-paint-mode"),
        });

        this.undoButton = new HistoryButton({
            session: this.session,
            el: stage.querySelector("#undo"),
            type: "undo",
        });

        this.redoButton = new HistoryButton({
            session: this.session,
            el: stage.querySelector("#redo"),
            type: "redo",
        });

        this.annotationInput = new AnnotationInput({
            session: this.session,
            el: stage.querySelector("#annotation"),
            editor: options.editor,
        });

        this.sizeSlider = new SizeSlider({
            session: this.session,
            el: stage.querySelector("#pane-paint-size")
        });

        this.setupListeners();
        this.session.on("render", this.update.bind(this));
    }

    /**
     * Updates the paint object to use the current file
     */
    public update() {
        this.session.paintColor = DEFAULT_COLOR;
        this.annotationInput.color = DEFAULT_COLOR_RGB;
    }

    /**
     * Sets up event listeners for painting interface elements
     */
    private setupListeners() {

        // the paint button - triggers paint mode on and off
        let btn = this.btn;
        btn.onclick = e => {
            if(!this.session.renderer) return;

            let active = this.stage.toggleMode("paint");
            this.session.renderer.mode = active ? "still" : "normal";
            active ? this.attachCanvasListeners() : this.detachCanvasListeners();
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
        if(!this.session.renderer) return;
        
        let rightButtonClicked = e.which === 3 || e.button === 2;
        if(rightButtonClicked) return; 

        let brush = this.session.brush;
        let selection = this.session.renderer.selection;
        let mask = this.session.x3p.mask;
        let texture = mask.getTexture();
        let textureSrc = mask.canvas.el;
    
        // @ts-ignore
        if(!selection || !brush[name] || (name !== "begin" && !brush.active)) return;

        let coords = selection.index;
        let args = [ coords[1], coords[0] ];
        let handler = brush[name];
        
        handler.apply(brush, args);
        texture.setPixels(textureSrc);
        this.session.renderer.drawMesh();
    }
}