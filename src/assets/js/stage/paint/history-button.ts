import Session from "../../session";

interface UndoButtonOptions {
    el: HTMLElement;
    session: Session;
    type: "undo" | "redo";
}

export default class HistoryButton {
    private el: HTMLElement;
    private session: Session;
    private type: "undo" | "redo";

    constructor(options: UndoButtonOptions) {
        this.el = options.el;
        this.session = options.session;
        this.type = options.type;
        
        this.setupListeners();
    }

    private setupListeners() {
        this.el.onclick = e => {
            if(!this.session.started) return;

            let canvas = this.session.x3p.mask.canvas;
            let texture = this.session.texture;
            let renderer = this.session.renderer;

            canvas[this.type]();
            texture.setPixels(canvas.el);
            renderer.drawMesh();
        };
    }
}