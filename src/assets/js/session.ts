import { EventEmitter } from "events";
import { clearCache } from "typedarray-pool";
import { X3P, Renderer } from "x3p.js";
import { Brush } from "@talenfisher/canvas";
import Logger from "./logger";

export interface SessionData {
    x3p?: X3P;
    filename?: string;
    renderer?: Renderer;
    brush?: Brush;
    paintColor?: string;
    texture?: any;
    paintMode?: "Paint" | "Lasso" | "Eraser";
}

export default class Session extends EventEmitter {
    private data: SessionData = {};

    public start(x3p: X3P, filename: string) {
        if(this.started) return;
        this.data.filename = filename;
        this.data.x3p = x3p;

        this.emit("start", this.data.x3p);
        Logger.action("session started", this.data.filename);
    }
    
    public end() {
        if(!this.started) return;
        
        if(this.data.renderer) {
            this.data.renderer.dispose();
        }

        this.emit("end");
        Logger.action("session ended", this.data.filename);
        this.data = {};
        clearCache();
    }

    public get x3p() {
        return this.data.x3p;
    }

    public get filename() {
        return this.data.filename;
    }

    public get renderer() {
        return this.data.renderer;
    }

    public set renderer(renderer: Renderer) {
        this.data.renderer = renderer;
        
        // @ts-ignore -- need to adjust x3p.js declaration to make the gl parameter optional 
        this.data.texture = this.data.x3p.mask.getTexture();
        this.data.brush = new Brush({ 
            canvas: this.data.x3p.mask.canvas,
            nolisteners: true 
        });

        this.emit("render", this.data);
    }

    public get texture() {
        return this.data.texture;
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