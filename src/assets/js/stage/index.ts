import "./paint/history-button";
import "./paint/color-switcher";
import "./paint/size-slider";
import "./paint/mode-switcher";
import "./paint/annotation-input";

import { X3P, Renderer } from "x3p.js";
import Paint from "./paint/index";
import Editor from "../editor";
import Session from "../session";
import { throws, CustomElement } from "../decorators";
import Logger from "../logger";
import fix3p from "../";

export interface StageOptions {
    el: HTMLElement;
    editor: Editor;
}

export type MODES = "normal" | "paint";

@CustomElement
export default class Stage extends HTMLElement {
    public canvas: HTMLCanvasElement;
    public renderer: Renderer;
    public paint: Paint;
    private fullscreenBtn: HTMLElement;

    connectedCallback() {
        this.canvas = this.querySelector("canvas");
        this.paint = new Paint({ 
            stage: this, 
            editor: document.querySelector("fix3p-editor")
        });

        console.log(this.paint);
        this.setupFullscreenBtn();

        Session.on("editor:ready", this.render.bind(this));
        Session.on("end", this.reset.bind(this));
    }

    public get enabled() {
        return !this.hasAttribute("disabled");
    }

    public set enabled(enabled: boolean) {
        enabled ? this.removeAttribute("disabled") : this.setAttribute("disabled", "disabled");
        Logger.action(`rendering ${enabled ? "enabled" : "disabled"}`, Session.filename);
    }

    public get mode() {
        return this.getAttribute("data-mode");
    }

    public set mode(value: string) {
        this.setAttribute("data-mode", value);
        Logger.action(`stage mode set to ${value}`, Session.filename);
    }

    public toggleMode(mode: MODES) {
        let currentMode = this.mode;
        let newMode = currentMode === mode ? "normal" : mode;
        this.mode = newMode;
        return newMode === mode;
    }

    public reset() {
        this.mode = "normal";
    }

    @throws({ message: "An error occured while rendering." })
    private render(x3p) {
        this.enabled = fix3p.render;
        if(!this.enabled || !Session.started || !Session.x3p) return;

        Session.renderer = x3p.render(this.canvas, {
            decimationFactor: fix3p.decimation
        });
        
        Logger.action("rendering started", Session.filename);
    }

    private setupFullscreenBtn() {
        let btn = this.fullscreenBtn = this.querySelector(".fa-expand");
        
        btn.onclick = (e) => {
            if(!this.enabled || !Session.started) return;
            document.fullscreenElement === null ? this.requestFullscreen() : document.exitFullscreen();
        };

        document.onfullscreenchange = (e) => {
            document.fullscreenElement === null ? btn.classList.remove("active") : btn.classList.add("active");
        }
    }
}