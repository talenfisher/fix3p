import Session from "./session";
import { CustomElement } from "./decorators";

@CustomElement
export default class Panorama extends HTMLElement {
    connectedCallback() {
        Session.on("editor:ready", () => setTimeout(() => this.view = "editor", 500));
        Session.on("end", () => this.view = "uploader");
    }

    set view(viewName: "uploader" | "editor") {
        this.setAttribute("view", viewName);
    }
}