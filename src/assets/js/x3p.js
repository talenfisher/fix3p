import saveAs from "file-saver";
import md5 from "blueimp-md5";
import { PlaneGeometry } from "three";

const REQUIRED_FILES = [
    "main.xml",
    "md5checksum.hex"
];

const parser = new DOMParser();
/**
 * Holds the x3p file
 */
export default class X3P {

    /**
     * Constructs a new X3P object
     * @param {ZipFile} zipfile the zip file to hold
     * @param {string} filename the filename of the zip file
     */
    constructor(zipfile, filename) {
        this.zipfile = zipfile;
        this.filename = filename;
        this.checkDirectory();
    }

    /**
     * Checks to see if the manifest is located within a directory 
     * inside the archive, stores the directory name if there is one
     */
    checkDirectory() {
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
        return this.zipfile.file(this.folder+filename).async(type);
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
    async hasValidChecksum() {
        let hash = md5(await this.retrieve("main.xml"));
        let checksum = (await this.retrieve("md5checksum.hex")).trim();

        if(checksum.match(/\*main\.xml$/)) hash += " *main.xml";

        if(hash !== checksum) return false;
        return true;
    }
} 