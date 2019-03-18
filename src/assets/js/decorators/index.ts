import Popup from "../popup";

/**
 * Expect the duration of a call to be no longer than specified
 * 
 * @param duration the max duration (in milliseconds)
 * @param callback the function to call
 */
export function time(max: number) {
    return function(target, key, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function(...args) {
            let start = performance.now();
            await method.apply(this, args);
            let end = performance.now();

            if(end - start > max) {
                console.warn(`Calling ${this.constructor.name}.${key} took longer than expected (took ${end - start}ms, expected <= ${max}ms)`);
            }
        }

        return descriptor;
    }
}

export function throws(options: { message: string, finally?: () => void }) {
    return function(target, key, descriptor) {
        const method = descriptor.value;

        descriptor.value = async function(...args) {
            try {
                await method.apply(this, args);
            } catch(e) {
                let error = new Popup(`<i class="fas fa-exclamation-triangle"></i> ${options.message}`, ["upload-error"]);
                error.display(2, true);
                console.error(e);
            } finally {
                if(options.finally) {
                    options.finally.apply(this);
                }
            }
        }
    
        return descriptor;
    }
}
