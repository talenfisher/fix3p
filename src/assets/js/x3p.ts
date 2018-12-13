import { saveAs } from "file-saver";
import md5 from "blueimp-md5";
import { EventEmitter } from "events";
import Renderer from "./renderer";

declare var fix3p;

const 
    parser = new DOMParser(),
    REQUIRED_FILES = [
        "main.xml",
        "md5checksum.hex"
    ];

 
export class X3PException {
    public message: string;

    constructor(message) {
        this.message = message;
    }

    toString() {
        return this.message;
    }
};

/**
 * Holds the x3p file
 */
export default class X3P extends EventEmitter {
    private zipfile: any;
    private filename: string;
    private surface: Renderer;
    private folder?: string;
    private manifestSrc: string;
    private manifest: Document;
    private actualChecksum: string;
    private expectedChecksum: string;
    private textureMap: HTMLImageElement;

    /**
     * Constructs a new X3P object
     * @param {ZipFile} zipfile the zip file to hold
     * @param {string} filename the filename of the zip file
     */
    constructor(zipfile, filename) {
        super();
        this.zipfile = zipfile;
        this.filename = filename;
        this.setFolder();
        
        if(!this.hasRequiredFiles()) {
            throw new X3PException("File does not conform to ISO5436-2");
        }
        
        this.extract();
        this.on("extracted", () => {
            if(!this.hasValidChecksum()) console.error("Found invalid checksum");
            
            if(fix3p.render) {
                setTimeout(() => this.surface.render(), 1000);
            }
        });
    }

    async extract() {
        this.manifestSrc = await this.retrieve("main.xml");
        this.manifest = parser.parseFromString(this.manifestSrc, "application/xml");
        this.actualChecksum = md5(this.manifestSrc);
        this.expectedChecksum = (await this.retrieve("md5checksum.hex")).trim();

        let blob = await this.retrieve("bindata/texture.jpeg", "blob");
        
        if(blob) {

            this.textureMap = new Image();
            this.textureMap.onload = () => this.emit("extracted");
            this.textureMap.src = URL.createObjectURL(blob);

            this.surface = new Renderer({ 
                manifest: this.manifest,
                data: await this.retrieve("bindata/data.bin", "arraybuffer"),
                texture: this.textureMap
            });

        } else {
            this.surface = new Renderer({ 
                manifest: this.manifest,
                data: await this.retrieve("bindata/data.bin", "arraybuffer")
            });

            this.emit("extracted");
        }
    }

    /**
     * Checks to see if the manifest is located within a directory 
     * inside the archive, stores the directory name if there is one
     */
    setFolder() {
        this.folder = "";

        let result = this.zipfile.file(/main\.xml$/g);
        if(result.length > 0 && result[0].name !== "main.xml") {
            this.folder = result[0].name.replace("main.xml", "");
        }
    }

    /**
     * Retrieves the contents of a file within the zip archive
     * @param {string} filename name of the file to retrieve
     * @return {string} the contents of the file
     */
    retrieve(filename, type = "text") {
        let file = this.zipfile.file(this.folder+filename);
        return file ? file.async(type) : null;
    }

    /**
     * Updates the contents of a file within the zip archive
     * @param {string} filename name of the file to update
     * @param {string} contents contents to update the file with
     */
    update(filename, contents) {
        this.zipfile.file(this.folder+filename, contents);
    }

    /**
     * Downloads the zip file to the user's computer
     * @param {string} filename the filename to use
     */
    async download(filename = this.filename) {
        let blob = await this.zipfile.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });

        saveAs(blob, filename);
    }

    /**
     * Check to see if the zip file meets the requirements (must contain main.xml and md5checksum.hex)
     */
    hasRequiredFiles() {
        for(let requirement of REQUIRED_FILES) {
            if(!Object.keys(this.zipfile.files).includes(this.folder+requirement)) {
                return false;
            }
        }
        
        return true; 
    }
 
    /** 
     * Check to see if the checksum of the x3p file is correct
     */
    hasValidChecksum() {
        if(typeof this.expectedChecksum === "undefined") return false;
        if(this.expectedChecksum.match(/\*main\.xml$/)) this.actualChecksum += " *main.xml";
        this.expectedChecksum === this.actualChecksum;
    }
}  