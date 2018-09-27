import saveAs from "file-saver";

export default class ZipHolder {
    constructor(zipfile = null) {
        this._zipfile = zipfile;
    }

    get zipfile() {
        return this._zipfile;
    }

    set zipfile(zipfile) {
        this._zipfile = zipfile;
    }

    get filename() {
        return this._filename;
    }

    set filename(filename) {
        this._filename = filename;
    }

    update(filename, contents) {
        this.zipfile.file(filename, contents);
    }

    download(filename = "file.x3p") {
        this.zipfile
        .generateAsync({type:"blob"})
        .then(blob => saveAs(blob, filename));
    }
}