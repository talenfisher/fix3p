import { X3P, Renderer } from "x3p.js";

const $file = Symbol();

interface StageOptions {
    el: HTMLElement;
}

export default class Stage {
    private el: HTMLElement;
    private canvas: HTMLCanvasElement;
    private fullscreenBtn: HTMLElement;
    private renderer: Renderer;
    private [$file]?: X3P;

    constructor(options: StageOptions) {
        this.el = options.el;
        this.canvas = this.el.querySelector("canvas");
        this.setupFullscreenBtn();
        window.onresize = (e) => this.adjust();
    }

    public get enabled() {
        return this.el.hasAttribute("disabled");
    }

    public set enabled(enabled: boolean) {
        if(enabled) {
            this.el.removeAttribute("disabled");
        } else {
            this.el.setAttribute("disabled", "disabled");
        }
    }

    public get file() {
        return this[$file];
    }

    public set file(x3p: X3P) {
        this[$file] = x3p;
        this.renderer = x3p.render(this.canvas);
    }

    public clear() {
        if(this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        if(this[$file]) {
            this[$file] = null;
        }
    }

    private setupFullscreenBtn() {
        let btn = this.fullscreenBtn = this.el.querySelector(".fa-expand");
        
        btn.onclick = (e) => {
            if(!this.enabled) return;
            document.fullscreenElement === null ? this.el.requestFullscreen() : document.exitFullscreen();
        };

        document.onfullscreenchange = (e) => {
            document.fullscreenElement === null ? btn.classList.remove("active") : btn.classList.add("active");
            this.adjust();
        }
    }

    private adjust() {
        this.adjustCanvasSize();
        this.adjustPixelRatio();
    }

    private adjustCanvasSize() {
        this.canvas.setAttribute("width", this.canvas.offsetWidth.toString());
        this.canvas.setAttribute("height", this.canvas.offsetHeight.toString());
    }

    private adjustPixelRatio() {
        if(!this.renderer) return;

        let scene = this.renderer.scene;
        let pixelRatio = this.canvas.width / this.canvas.height;

        scene.update({ pixelRatio });
    }
}