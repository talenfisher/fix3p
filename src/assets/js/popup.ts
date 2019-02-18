/**
 * Display a popup on the page
 */
export default class Popup {
    public el: Element;

    /**
     * Constructs a new popup
     */
    constructor(message: string, classes: string[] = [], id: string = "") {
        this.createElement(message, classes, id);
    } 

    /**
     * Update the popup with a new message
     * 
     * @param message the content to update the popup with
     */
    public update(message: string) {
        this.el.innerHTML = `<div class="popup-content">${message}</div>`;
    }

    /**
     * Displays the popup
     * 
     * @param duration the amount of time in seconds to display the popup.  If 0, it will display until manually hidden
     * @param remove whether or not to remove the popup after hiding it, if the duration is > 0.
     */
    display(duration: number = 0, remove: boolean = false) {
        this.el.classList.add("active");

        if(duration > 0) setTimeout(() => this.hide(remove), duration * 1000);
    }

    /**
     * Hides the popup
     * 
     * @param remove whether or not to remove the element after hiding it
     */
    hide(remove: boolean = false) {
        this.el.classList.remove("active");
        if(remove) setTimeout(() => this.destroy(), 1000);
    }

    /**
     * Destroys the popup
     */
    destroy() {
        this.el.remove();
    }

    /**
     * Creates a new popup element
     * @param message the message to display in the popup
     * @param classes optional list of classes to add to the popup
     */
    private createElement(message: string, classes: string[] = [], id: string = "") {
        this.el = document.createEasy("div", {
            id,
            props: { innerHTML: `<div class="popup-content">${message}</div>` },
            classes: [ "popup" ].concat(classes)
        })

        document.querySelector("body").appendChild(this.el);
    }
}