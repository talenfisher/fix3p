export default class Popup {
    public el: Element;

    /**
     * Constructs a new popup
     */
    constructor(message, classes = [], id = "") {
        this.createElement(message, classes, id);
    } 

    /**
     * Creates a new popup element
     * @param {string} message the message to display in the popup
     * @param {string[]} classes optional list of classes to add to the popup
     */
    createElement(message, classes = [], id = "") {
        this.el = document.createEasy("div", {
            id,
            props: { innerHTML: `<div class="popup-content">${message}</div>` },
            classes: [ "popup" ].concat(classes)
        })

        document.querySelector("body").appendChild(this.el);
    }

    update(message) {
        this.el.innerHTML = `<div class="popup-content">${message}</div>`;
    }

    /**
     * Displays the popup
     * @param {int} duration the amount of time in seconds to display the popup.  If 0, it will display until manually hidden
     * @param {boolean} remove whether or not to remove the popup after hiding it, if the duration is > 0.
     */
    display(duration = 0, remove = false) {
        this.el.classList.add("active");

        if(duration > 0) setTimeout(() => this.hide(remove), duration * 1000);
    }

    /**
     * Hides the popup
     * @param {boolean} remove whether or not to remove the element after hiding it
     */
    hide(remove = false) {
        this.el.classList.remove("active");
        if(remove) setTimeout(() => this.destroy(), 1000);
    }

    /**
     * Destroys the popup
     */
    destroy() {
        this.el.remove();
    }
}