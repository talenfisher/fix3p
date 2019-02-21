import { EventEmitter } from "events";
import { clearCache } from "typedarray-pool";
import { X3P, Renderer } from "x3p.js";
import { Brush } from "@talenfisher/canvas";

export interface SessionData {
    x3p?: X3P;
    renderer?: Renderer;
    brush?: Brush;
    paintColor?: string;
    paintMode?: "Paint" | "Lasso" | "Eraser";
}

export default class Session extends EventEmitter {
    private data: SessionData = {};

    public start(x3p: X3P) {
        if(this.started) return;
        this.data.x3p = x3p;
        this.emit("start", this.data.x3p);
    }
    
    public end() {
        if(!this.started) return;
        
        if(this.data.renderer) {
            this.data.renderer.dispose();
        }

        this.emit("end");
        this.data = {};
        clearCache();
    }

    public get x3p() {
        return this.data.x3p;
    }

    public get renderer() {
        return this.data.renderer;
    }

    public set renderer(renderer: Renderer) {
        this.data.renderer = renderer;
        this.data.brush = new Brush({ 
            canvas: this.data.x3p.mask.canvas,
            nolisteners: true 
        });

        this.emit("render", this.data);
    }

    public get brush() {
        return this.data.brush;
    }

    public get paintColor() {
        if(!this.data.brush) return;

        return this.data.paintColor;
    }

    public set paintColor(color: string) {
        if(!this.data.brush) return;

        this.data.paintColor = color;
        
        if(this.paintMode !== "Eraser") {
            this.data.brush.color = color;
        }
        
        this.emit("paint:color-switch", color);
    }

    public get paintMode() {
        return this.data.paintMode;
    }

    public set paintMode(mode: "Paint" | "Lasso" | "Eraser") {
        this.data.paintMode = mode;
        this.emit("paint:mode-switch", mode);
    }

    public get started() {
        return typeof this.data.x3p !== "undefined";
    }   
}