import { CustomElement } from "../decorators";
import Editor from "../editor";
import Session from "../session";
import sanitize from "../sanitize";
import Color from "@talenfisher/color";
import ColorSwitcher from "./paint/color-switcher";

@CustomElement("annotation")
export default class Annotation extends HTMLElement {
    public onactivate: any;

    connectedCallback() {
        this.contentEditable = "true";

        this.color = this.getAttribute("color");
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

    set color(value: string) {
        let color = new Color(value);
        this.setAttribute("color", color.hex);
        this.style.background = color.hex;
        this.style.color = color.isDark ? "white" : "black";
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
        let before = this.value;
        this.innerHTML = value;

        if(value !== before) {
            this.dispatchEvent(new Event("change"));
        }
    }

    toggle() {
        this.active = !this.active;
    }

    private setupListeners() {        
        this.onclick = () => {
            this.active = true;

            let colorSwitcher = document.querySelector("fix3p-colorswitcher") as ColorSwitcher;
            colorSwitcher.value = this.color;
        }

        this.onkeyup = () => {
            let value = sanitize(this.value);
            let annotations = Session.x3p.mask.annotations;
            let color = this.color;
            let x3p = Session.x3p;
            let editorEl = document.querySelector(`[data-tag="Annotation"][data-color="${color}"] input`) as HTMLInputElement | null;

            annotations[color] = value;
                
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
        };

        Session.on("paint:color-switch", color => {
            if(color === this.color && !this.active) {
                this.active = true;
            }
        });
    }

    static create(color: string, value: string = "") {
        let node = document.createElement("fix3p-annotation") as Annotation;
        node.color = color;
        node.value = value;
        return node;
    }
}