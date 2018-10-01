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

    download(filename = "file.x3p") {
        this.zipfile
        .generateAsync({type:"blob"})
        .then(blob => saveAs(blob, filename));
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