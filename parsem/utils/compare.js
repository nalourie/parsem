/* comparison, typing and equality utilities. */

import {
    check,
    checkRaises,
    suite,
    test
} from './test';


/**
 * isType : (Object, Constructor) => Boolean
 * =========================================
 * Return true if instance was made with constructor.
 *
 * Return true if instance was made with constructor, and false
 * otherwise. Since null has no constructor, a null instance will
 * always return false. Similarly, since undefined has no constructor,
 * an undefined instance will also always return false.
 *
 * @param {Object} instance - the object whose type should be tested.
 * @param {Constructor} type - the constructor function to check
 *   instance against.
 */
function isType(instance, type) {
    // handle null type as a special case
    return (
        instance !== null
            && instance !== undefined
            && instance.constructor === type
    );
}
suite('compare', [
    test('isType', function () {
        check(
            "isType should always return false on undefined.",
            !isType(undefined, undefined)
        );
        check(
            "isType should always return false on null.",
            !isType(null, null)
        );
        check(
            "isType should correctly identify a type.",
            isType("foo", String)
        );
        check(
            "isType should say when something is not a type.",
            !isType("foo", Boolean)
        );
    })
]);


/**
 * equal : (Any, Any) => Boolean
 * =============================
 * Return true if the objects are equal, false otherwise.
 *
 * Compare objects and arrays recursively for equality.
 *
 * @param {Object} left - one of the objects to compare.
 * @param {Object} right - one of the objects to compare.
 */
function equal(left, right) {
    if (isType(left, Array) && isType(right, Array)) {
        if (left.length !== right.length) {
            return false;
        }
        return left.every((v,i) => equal(v, right[i]));
    } else if (isType(left, Object) && isType(right, Object)) {
        const lProps = Object.getOwnPropertyNames(left);
        const rProps = Object.getOwnPropertyNames(right);
        if (!equal(lProps, rProps)) {
            return false;
        }
        return lProps.every(
            (p, i) => equal(left[p], right[rProps[i]])
        );
    } else {
        return left === right;
    }
}
suite('compare', [
    test('equal', function () {
        // undefined
        check(
            "equal should work for undefined and undefined.",
            equal(undefined, undefined)
        );
        check(
            "equal should work for undefined and a string.",
            !equal(undefined, "a")
        );
        // null
        check(
            "equal should work for null and null.",
            equal(null, null)
        );
        check(
            "equal should work for null and a string.",
            !equal(null, "a")
        );
        // strings
        check(
            "equal should work for equal strings.",
            equal("a", "a")
        );
        check(
            "equal should work for unequal strings.",
            !equal("a", "b")
        );
        // ints
        check(
            "equal should work for equal ints.",
            equal(1, 1)
        );
        check(
            "equal should work for unequal ints.",
            !equal(1, 2)
        );
        // booleans
        check(
            "equal should work for equal booleans.",
            equal(true, true)
        );
        check(
            "equal should work for unequal booleans.",
            !equal(true, false)
        );
        // arrays
        check(
            "equal should work for equal arrays.",
            equal([1, 2], [1, 2])
        );
        check(
            "equal should work for unequal arrays.",
            !equal([1, 2], [1, 1])
        );
        check(
            "equal should work for unequal arrays of different lengths.",
            !equal([1, 2], [1, 2, 3])
        );
        check(
            "equal should work for equal nested arrays.",
            equal([1, [1]], [1, [1]])
        );
        check(
            "equal should work for unequal nested arrays",
            !equal([1, [1]], [1, [1, 2]])
        );
        // objects
        check(
            "equal should work for equal objects.",
            equal({"a": 1}, {"a": 1})
        );
        check(
            "equal should work for unequal objects.",
            !equal({"a": 1}, {"a": 2})
        );
        check(
            "equal should work for equal nested objects.",
            equal({"a": {"b": 1}}, {"a": {"b": 1}})
        );
        check(
            "equal should work for unequal nested objects.",
            !equal({"a": {"b": 1}}, {"a": {"b": 2}})
        );
    })
]);


export { isType, equal };
