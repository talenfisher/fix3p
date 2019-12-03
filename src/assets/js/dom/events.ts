import { listeners } from "cluster";

/** =============================================================
 * Workaround for getting dispatchEvent to work with handlers that return promises
 */

interface Element {
    getEventListeners(type: string): CallableFunction[];
    dispatchEventAsync(event: Event): Promise<boolean>;
}

interface Event {
    canceled: boolean;
}

const _preventDefault = Event.prototype.preventDefault;
const _addEventListener = Element.prototype.addEventListener;
const _removeEventListener = Element.prototype.removeEventListener;


Event.prototype.preventDefault = function() {
    this.canceled = true;
    _preventDefault.call(this);
}

function backfillListenerList(element, listenerType) {
    if(typeof element._listeners === "undefined") {
        element._listeners = [];
    }

    if(typeof element._listeners[listenerType] === "undefined") {
        element._listeners[listenerType] = [];
    }
}

Element.prototype.addEventListener = function(type, handler) {
    backfillListenerList(this, type);
    this._listeners[type].push(handler);
    _addEventListener.call(this, type, handler);
}


Element.prototype.removeEventListener = function(type, handler) {
    backfillListenerList(this, type);

    const i = this._listeners.indexOf(handler);
    
    if(i !== -1) {
        delete this._listeners[i];
    }

    _removeEventListener.call(this, type, handler);
}

Element.prototype.getEventListeners = function(type) {
    return this._listeners[type];
}

Element.prototype.dispatchEventAsync = async function(event: Event) {
    for(let listener of this._listeners[event.type]) {
        if(event.canceled) return true;
        await listener.call(this, event);
    }

    return event.canceled;
}