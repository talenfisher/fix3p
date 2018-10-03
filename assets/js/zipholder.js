import saveAs from "file-saver";
import md5 from "md5";

const REQUIRED_FILES = [
    "main.xml",
    "md5checksum.hex"
];

/**
 * Holds the x3p file
 */
export default class ZipHolder {

    /**
     * Constructs a new ZipHolder
     * @param {ZipFile} zipfile the zip file to hold
     * @param {string} filename the filename of the zip file
     */
    constructor(zipfile, filename) {
        this.zipfile = zipfile;
        this.filename = filename;
    }

    /**
     * Retrieves the contents of a file within the zip archive
     * @param {string} filename name of the file to retrieve
     * @return {string} the contents of the file
     */
    retrieve(filename) {
        return this.zipfile.file(filename).async("text");
    }

    /**
     * Updates the contents of a file within the zip archive
     * @param {string} filename name of the file to update
     * @param {string} contents contents to update the file with
     */
    update(filename, contents) {
        this.zipfile.file(filename, contents);
    }

    /**
     * Downloads the zip file to the user's computer
     * @param {string} filename the filename to use
     */
    async download(filename = this.filename) {
        let blob = await this.zipfile.generateAsync({type:"blob"});
        saveAs(blob, filename);
    }

    /**
     * Check to see if the zip file meets the requirements (must contain main.xml and md5checksum.hex)
     */
    hasRequiredFiles() {
        for(let requirement of REQUIRED_FILES) {
            if(!Object.keys(this.zipfile.files).includes(requirement)) {
                return false;
            }
        }
        
        return true; 
    }

    /**
     * Check to see if the checksum of the x3p file is correct
     */
    async hasValidChecksum() {
        let contents = await this.retrieve("main.xml");
        let checksum = await this.retrieve("md5checksum.hex");
        if(md5(contents)+" *main.xml" !== checksum.trim()) return false;
        return true;
    }
} 