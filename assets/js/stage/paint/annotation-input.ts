import Session from "../../session";
import { rgbToHex } from "../../color";
import Editor from "../../editor";

interface AnnotationOptions {
    session: Session;
    editor: Editor;
    el: HTMLInputElement;
}

export default class AnnotationInput {
    private session: Session;
    private editor: Editor;
    private el: HTMLInputElement;

    constructor(options: AnnotationOptions) {
        this.el = options.el;
        this.session = options.session;
        this.editor = options.editor;

        this.setupListeners();
        this.session.on("paint:color-switch", color => this.color = color);
    }

    public get color() {
        return this.el.style.color;
    }

    public set color(color: string) {
        if(!this.session.started) return;
        
        let el = this.el;
        let x3p = this.session.x3p;

        el.style.color = color;
        el.value = x3p.mask.annotations[color] || "";
    }

    public get value() {
        return this.el.value;
    }

    public set value(value: string) {
        this.el.value = value;
    }

    private setupListeners() {
        this.el.onkeyup = e => {
            if(!this.session.started) return;

            let annotations = this.session.x3p.mask.annotations;
            let color = rgbToHex(this.el.style.color);
            let value = this.el.value;    
            
            annotations[color] = value;
            this.updateEditor(color, value);
        };
    }

    private updateEditor(color, value) {
        if(!this.session.started) return;

        let x3p = this.session.x3p;
        let editorEl = document.querySelector(`[data-tag="Annotation"][data-color="${color}"] input`) as HTMLInputElement | null;
            
        if(editorEl) {
            editorEl.value = value;
        } else {
            let target = document.querySelector(`[data-tag="Annotations"]`);
            let source = { children: [ x3p.manifest.getNode(`Annotation[color="${color}"]`) ] };

            if(!target) {
                let maskEl = document.querySelector(`[data-tag="Mask"]`);
                if(!maskEl) return;

                source = { children: [ x3p.manifest.getNode("Record3 Mask Annotations") ] };
                target = maskEl;
            } 

            this.editor.inputify(source, target);
        }
    }
}