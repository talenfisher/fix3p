import Session from "../../session";
import { rgbToHex } from "../../color";
import Editor from "../../editor";
import Logger from "../../logger";
import { CustomElement } from "../../decorators";

interface AnnotationOptions {
    editor: Editor;
    el: HTMLInputElement;
}

@CustomElement
export default class AnnotationInput extends HTMLElement {
    private input: HTMLInputElement;

    connectedCallback() {
        this.input = this.querySelector("input");
        this.setupListeners();
        Session.on("paint:color-switch", color => this.color = color);
    }

    public get color() {
        return this.input.style.color;
    }

    public set color(color: string) {
        if(!Session.started) return;

        let x3p = Session.x3p;
        this.input.style.color = color;
        this.value = x3p.mask.annotations[color] || "";
    }

    public get value() {
        return this.input.value;
    }

    public set value(value: string) {
        this.input.value = value;
    }

    private setupListeners() {
        this.input.onkeyup = e => {
            if(!Session.started) return;

            let annotations = Session.x3p.mask.annotations;
            let color = rgbToHex(this.color);
            let value = this.value;    
            
            annotations[color] = value;
            this.updateEditor(color, value);
        };
    }

    private updateEditor(color, value) {
        if(!Session.started) return;

        let x3p = Session.x3p;
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

            let editor = document.querySelector("fix3p-editor") as Editor;
            editor.inputify(source, target);
        }
    }
}