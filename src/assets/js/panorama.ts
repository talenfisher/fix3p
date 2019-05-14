import Session from "./session";
import { CustomElement } from "./decorators";

@CustomElement("panorama")
export default class Panorama extends HTMLElement {
    connectedCallback() {
        Session.on("editor:ready", () => this.view = "editor");
        Session.on("end", () => this.view = "uploader");
    }

    set view(viewName: "uploader" | "editor") {
        this.setAttribute("view", viewName);
    }
}