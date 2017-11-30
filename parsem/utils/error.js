/* utilites for custom error classes. */


/**
 * BaseError
 * =========
 * A base class for custom errors.
 *
 * BaseError correctly sets a name, message, and stack trace for
 * itself, and should be used as a base class for all custom error
 * types.
 *
 * @param {string} message - the message that the error should
 *   display.
 */
class BaseError {
    constructor(message) {
        this.name = this.constructor.name;
        this.message = message || "";
        this.stack = (new Error()).stack;
    }
}
BaseError.prototype = new Error();


export { BaseError };
