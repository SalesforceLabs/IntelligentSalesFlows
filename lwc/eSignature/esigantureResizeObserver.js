const DELAY = 400; // the rateLimit in milliseconds.

/**
 * Limits the number of times a resize event function is called.
 * @constructs ResizeObserver
 * @param resizeCallback - the resize handler that needs to be debounced.
 */
export class ResizeObserver {
    constructor(resizeCallback) {
        this._delayedResizeCallback = throttle(resizeCallback, DELAY);
    }

    observe() {
        if (!this._hasWindowResizeHandler) {
            window.addEventListener('resize', this._delayedResizeCallback);
            this._hasWindowResizeHandler = true;
        }
    }

    disconnect() {
        window.removeEventListener('resize', this._delayedResizeCallback);
    }
}


/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 */
function throttle(fn, delay) {
    let running = false;

    return () => {
        if (running) {
            return;
        }
        running = true;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            fn();
            running = false;
        }, delay);
    };
}

/**
 * Creates and returns a new debounced version of the passed function that will postpone its execution until after
 * wait milliseconds have elapsed since the last time it was invoked.
 */
export function debounce(fn, delay, options) {
    options = options || {};

    function leading() {
        let invoked = false;
        let timer;
        return () => {
            const args = Array.prototype.slice.apply(arguments);
            if (!invoked) {
                invoked = true;
                fn.apply(null, args);
                return;
            }
            clearTimeout(timer);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            timer = setTimeout(() => {
                invoked = false;
            }, delay);
        };
    }

    function trailing() {
        let timer;
        return () => {
            const args = Array.prototype.slice.apply(arguments);
            clearTimeout(timer);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            timer = setTimeout(() => {
                fn.apply(null, args);
            }, delay);
        };
    }

    return options.leading ? leading() : trailing();
}