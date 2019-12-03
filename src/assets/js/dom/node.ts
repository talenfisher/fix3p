interface Node {
    querySelectorImmediate(query: string): Node;
    index(): number;
    getPath(): Array<string>;
    on(event: string, handler: (e) => any);
}

interface NodeList {
    on(event: string, handler: (e) => any);
    addClass(className: string): void;
    addClasses(classes: string[]): void;
    removeClass(className: string): void;
    removeClasses(classes: string[]): void;
}

/**
 * Queries only immediate children
 * @param {Node} query 
 */
Node.prototype.querySelectorImmediate = function(query) {
    for(var node of this.children) {
        if(node.matches(query)) return node;
    }
    
    return undefined;
}

/**
 * Gets the node's position relative to its siblings
 */
Node.prototype.index = function() {
    let parent = this.parentElement;
    let i = 0;

    for(let node of parent.children) {
        if(node === this) return i;
        i++;
    }
}

/**
 * Build fully qualified selector 
 */
Node.prototype.getPath = function() {
    let tagnames = [ this.tagName ];
    let parent = this.parentElement;

    while(parent !== this.ownerDocument.documentElement) {
        tagnames.push(parent.tagName);
        parent = parent.parentElement;
    }

    return tagnames.reverse();
}

/**
 * Shortcut for addEventListener
 */
Node.prototype.on = function(event, handler) {
    this.addEventListener(event, handler);
}


/**
 * Adds an event handler to every element of a node list
 */
NodeList.prototype.on = function(event, handler) {
    for(let node of this) {
        node.addEventListener(event, handler);
    }
}

/**
 * Adds a class to every node in the nodelist.
 */
NodeList.prototype.addClass = function(className: string): void {
    for(let node of this) {
        node.classList.add(className);
    }
}

/**
 * Adds an array of classes to every node in the nodelist.
 */
NodeList.prototype.addClasses = function(classes: string[]): void {
    for(let className of classes) {
        this.addClass(className);
    }
}

/**
 * Removes a class from every node in the node list.
 */
NodeList.prototype.removeClass = function(className: string): void {
    for(let node of this) {
        node.classList.remove(className);
    }
}

/**
 * Removes an array of classes from every node in the node list.
 */
NodeList.prototype.removeClasses = function(classes: string[]): void {
    for(let className of classes) {
        this.removeClass(className);
    }
}