import { CustomElement } from "./decorators";

@CustomElement("fileinput")
export default class FileInput extends HTMLElement {
    private input: HTMLInputElement;

    connectedCallback() {
        this.input = this.createInput();
        this.update("");
        this.setupListeners();
    }

    private update(value: string) {
        this.innerHTML = (value === "" || !/\.xml$/.test(value)) ? "Choose a File" : value;

        if(value !== "" && this.input.files.length > 0) {         
            let reader = new FileReader();

            reader.onerror = () => {
                this.input.value = "";
                this.update("");
            }
            
            reader.onload = (e: ProgressEvent) => {
                let target = e.target as FileReader;
                localStorage.setItem("presets", target.result as string);
            }

            reader.readAsText(this.input.files[0]);
        }
    }

    private setupListeners() {
        this.onclick = () => this.input.click();
        this.input.onchange = () => this.update(this.input.value || "");
    }

    private createInput() {
        let doc = this.ownerDocument;
        let input = doc.createElement("input");
        input.type = "file";
        input.accept = ".xml";

        return input;
    }
}