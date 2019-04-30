import { CustomElement } from "../decorators";
import Annotation from "./annotation";
import Session from "../session";

@CustomElement
export default class Annotations extends HTMLElement {
    private panorama: HTMLElement;
    private activeAnnotation: Annotation;

    connectedCallback() {
        this.panorama = this.createPanorama();

        let observer = new MutationObserver((mutations) => {
            for(let mutation of mutations) {
                if(mutation.type !== "childList" || mutation.addedNodes.length === 0) {
                    return;
                }

                mutation.addedNodes.forEach((node: Annotation) => {
                    if(node.nodeName.toLowerCase() !== "fix3p-annotation") return;            
                    node.onactivate = () => this.view(node);
                });
            }
        });

        observer.observe(this.panorama, { childList: true });
        this.panorama.innerHTML = this.innerHTML;        
        this.innerHTML = "";
        this.appendChild(this.panorama);
        this.setupListeners();
    }

    view(node: Annotation) {
        this.querySelectorAll("fix3p-annotation").forEach((annotation: Annotation) => {
            if(annotation !== node) {
                annotation.active = false;
            }
        });

        let panoramaMiddle = this.offsetWidth / 2;
        let nodeMiddle = node.offsetWidth / 2;
        let offset = panoramaMiddle - node.offsetLeft - nodeMiddle;
        this.panorama.style.transform = `translate(${offset}px)`;
        this.activeAnnotation = node;
    }

    has(color: string) {
        return this.getNode(color) !== null;
    }

    get(color: string) {
        return this.has(color) ? this.getNode(color).innerHTML : undefined;
    }

    getNode(color: string) {
        return this.querySelector(`fix3p-annotation[color="${color}"]`);
    }

    set(color: string, value: string) {
        if(!this.has(color)) {
            let el = Annotation.create(color, value);
            this.panorama.appendChild(el);
            
        } else {
            let el = this.getNode(color) as Annotation;
            el.value = value;
        }
    }

    reset() {
        this.panorama.innerHTML = "";
    }
    
    private createPanorama() {
        let panorama = this.ownerDocument.createElement("div");
        panorama.classList.add("annotations-panorama");
        return panorama;
    }

    private setupListeners() {
        window.addEventListener("resize", () => this.view(this.activeAnnotation));
        document.addEventListener("fullscreenchange", () => this.view(this.activeAnnotation));
        
        Session.on("end", this.reset.bind(this));
        Session.on("paint:color-switch", async color => {
            if(!this.has(color) && color !== Session.backgroundColor) {
                this.set(color, "");
                
                let node = this.getNode(color) as Annotation;
                let value = Session.x3p.mask.annotations[color];

                await node.ready;
                node.active = true;
                node.value = value || "";
            }
        });
    }
}