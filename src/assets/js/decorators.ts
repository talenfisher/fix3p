import Popup from "./popup";
import Logger from "./logger";

/**
 * Expect the duration of a call to be no longer than specified
 * 
 * @param duration the max duration (in milliseconds)
 * @param callback the function to call
 */
export function time(options: { max: number, reset?: boolean }) {
    return function(target, key, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function(...args) {
            var tryReset = () => {
                if(options.reset && this.reset) {
                    this.reset();
                }
            };

            let filename = this.session ? this.session.filename : null;            
            let warning = setTimeout(() => Logger.warn(`Calling ${this.constructor.name}.${key} is taking a while (max = ${options.max}ms)`, filename), options.max);
            let start = performance.now();
            let returnValue = await method.apply(this, args);
            clearTimeout(warning);

            let end = performance.now();
            let diff = end - start;
            if(diff > options.max) {
                Logger.warn(`${this.constructor.name}.${key} took ${diff}ms`, filename);
            }

            tryReset();
            return returnValue;
        }

        return descriptor;
    }
}

export function throws(options: { message: string, classes?: string[], reset?: boolean }) {
    return function(target, key, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function(...args) {
            try {
                return await method.apply(this, args);

            } catch(e) {
                let error = new Popup(`<i class="fas fa-exclamation-triangle"></i> ${options.message}`, options.classes);
                error.display(2, true);

                let filename = this.session ? this.session.filename : null;
                Logger.error(e, filename);

            } finally {
                if(options.reset && this.reset) {
                    this.reset();
                }

            }
        }
    
        return descriptor;
    }
}
