/* utilities for making assertions. */

import { BaseError } from './error';
import {
    check,
    checkRaises,
    suite,
    test
} from './test';


/**
 * AssertionError
 * ==============
 * An error thrown when a condition is not satisfied.
 */
class AssertionError extends BaseError {}


/**
 * assert : (Boolean, String) => null
 * ==================================
 * Assert that a condition is satisfied.
 *
 * Assert that condition is true, if condition is false then throw an
 * error with message.
 *
 * @param {Boolean} condition - a boolean that should be true.
 * @param {String} message - the error message to display if condition
 *   is false.
 */
function assert(condition, message) {
    if (!condition) {
        throw new AssertionError(message);
    }
}
suite('assert', [
    test('assert', function () {
        checkRaises(
            "assert should raise assertion errors when condition is false.",
            function(){
                assert(false, "This message should print to check the 'assert' function.")
            },
            AssertionError
        );
        assert(true, "This message should not print.")
    })
]);


export {
    AssertionError,
    assert
};
