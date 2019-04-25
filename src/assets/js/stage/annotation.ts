import { CustomElement } from "../decorators";
import Editor from "../editor";
import Session from "../session";

@CustomElement
export default class Annotation extends HTMLElement {
    public onactivate: any;

    connectedCallback() {
        this.contentEditable = "true";
        this.style.background = this.color;
        this.setupListeners();
    }

    get ready() {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if(this.onactivate !== null) {
                    clearInterval(interval);
                    resolve(this);
                }
            }, 50);
        });
    }

    get color() {
        return this.getAttribute("color") as string;
    }

    set color(color) {
        this.setAttribute("color", color);
    }

    get active() {
        return this.hasAttribute("active");
    }

    set active(active: boolean) {
        if(active) {
            this.setAttribute("active", "");
            this.dispatchEvent(new CustomEvent("activate"));
            
            if(this.onactivate) {
                this.onactivate();
            }
        } else {
            this.removeAttribute("active");
        }
    }

    get value() {
        return this.innerHTML;
    }

    set value(value) {
        this.innerHTML = value;
        this.dispatchEvent(new Event("change"));
    }

    toggle() {
        this.active = !this.active;
    }

    private setupListeners() {
        Session.on("paint:color-switch", color => this.active = color === this.color);
        this.onclick = () => this.active = true;
        this.onkeyup = () => {
            let annotations = Session.x3p.mask.annotations;
            let color = this.color;
            let x3p = Session.x3p;
            let editorEl = document.querySelector(`[data-tag="Annotation"][data-color="${color}"] input`) as HTMLInputElement | null;

            annotations[color] = this.value;
                
            if(editorEl) {
                editorEl.value = this.value;
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

    static create(color: string, value: string = "") {
        let node = document.createElement("fix3p-annotation") as Annotation;
        node.color = color;
        node.value = value;
        return node;
    }
}