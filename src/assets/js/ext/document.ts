interface Document {
    createEasy(name: string, options?: object): Element;
    get(selector: string): any;
    getInt(selector: string): number;
    getFloat(selector: string): number;
}

interface CreateEasyOptions {
    props?: { [name: string]: any };
    attrs?: { [name: string]: any };
    classes?: Array<string>;
}

/**
 * Easily create elements
 * 
 * @param {string} name 
 * @param {object} options 
 */
Document.prototype.createEasy = function(name: string, options: CreateEasyOptions = {}) {
    let el = this.createElement(name);

    if(typeof options.props !== "undefined") {
        for(let prop in options.props) {
            el[prop] = options.props[prop];
        }
    }
    
    if(typeof options.attrs !== "undefined") {
        for(let attr in options.attrs) {
            el.setAttribute(attr, options.attrs[attr]);
        }
    }

    if(typeof options.classes !== "undefined") {
        for(let className of options.classes) {
            el.classList.add(className);
        }
    }

    return el;
}

/**
 * Gets the innerHTML value of a node by query selector
 * @param {string} selector 
 */
Document.prototype.get = function(selector) {
    let node = this.querySelector(selector);
    return node !== null ? node.innerHTML : "";
}


/**
 * Gets the innerHTML value of a node as an integer
 * @param {string} selector 
 */
Document.prototype.getInt = function(selector) {
    return parseInt(this.get(selector));
}

/**
 * Gets the innerHTML value of a node as a float
 * @param {string} selector 
 */
Document.prototype.getFloat = function(selector) {
    return parseFloat(this.get(selector));
}
