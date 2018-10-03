import saveAs from "file-saver";

const REQUIRED_FILES = [
    "main.xml",
    "md5checksum.hex"
];

export default class ZipHolder {
    constructor(zipfile, filename) {
        this.zipfile = zipfile;
        this.filename = filename;
    }

    retrieve(filename) {
        return this.zipfile.file(filename).async("text");
    }

    update(filename, contents) {
        this.zipfile.file(filename, contents);
    }

    async download(filename = "file.x3p") {
        let blob = await this.zipfile.generateAsync({type:"blob"});
        saveAs(blob, filename);
    }

    isValid() {
        for(let requirement of REQUIRED_FILES) {
            if(!Object.keys(this.zipfile.files).includes(requirement)) {
                return false;
            }
        }
        return true; 
    }
} 