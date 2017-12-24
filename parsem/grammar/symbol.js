/* functions for working with symbols in production rules. */

import {
    check,
    suite,
    test
} from '../utils/test';


// predicates for symbols

/**
 * isTerminal : String -> Boolean
 *   Return true if s is a terminal symbol, otherwise false.
 *
 *   @param {String} s - the string to test if it's a terminal.
 */
function isTerminal(s) {
    return s.charAt(0) != '$' || s.length <= 1;
}
suite('symbol', [
    test('isTerminal', function () {
        check(
            "isTerminal should return true if string is not a terminal.",
            isTerminal('foo')
        );
        check(
            "isTerminal should return false if string is a non-terminal.",
            !isTerminal('$foo')
        );
    })
]);


/**
 * isNonTerminal : String -> Boolean
 *   Return true if s is a non-terminal, false otherwise.
 *
 *   @param {String} s - the string to test if it's a non-terminal.
 */
function isNonTerminal(s) {
    return !isTerminal(s);
}
suite('symbol', [
    test('isNonTerminal', function () {
        check(
            "isNonTerminal should return true if string is a non-terminal.",
            isNonTerminal('$a')
        );
        check(
            "isNonTerminal should return false if string is too short.",
            !isNonTerminal('$')
        );
        check(
            "isNonTerminal should return false if string is not a non-terminal.",
            !isNonTerminal('foo')
        );
    })
]);


/**
 * isOptional : String -> Boolean
 *   Return true if s is an optional, false otherwise.
 *
 *   Both terminals and non-terminals can be optionals.
 *
 *   @param {String} s - the string to test if it's an optional.
 */
function isOptional(s) {
    return s.charAt(0) == '?' && s.length > 1;
}
suite('symbol', [
    test('isOptional', function () {
        check(
            "isOptional should return true if string is an optional.",
            isOptional('?a')
        );
        check(
            "isOptional should return false if string is too short.",
            !isOptional('?')
        );
        check(
            "isOptional should return false if string is not an optional.",
            !isOptional('foo')
        );
    })
]);


// functions for modifying symbols

/**
 * stripOptional : String -> Boolean
 *   Strip the optional marker from a symbol.
 *
 *   Strip optional is idempotent, and will just return the symbol if
 *   the symbol is not an optional.
 *
 *   @param {String} s - the optional to strip to a regular symbol.
 */
function stripOptional(s) {
    return isOptional(s) ? s.slice(1) : s
}
suite('symbol', [
    test('stripOptional', function () {
        check(
            "stripOptional should strip the optional from a terminal.",
            stripOptional("?say") === "say"
        );
        check(
            "stripOptional should strip the optional from a non-terminal.",
            stripOptional("?$say") === "$say"
        );
        check(
            "stripOptional should return s if it's a non-optional terminal.",
            stripOptional("say") === "say"
        );
        check(
            "stripOptional should return s if it's non-optional non-terminal.",
            stripOptional("$say") === "$say"
        );
    })
]);


export {
    isTerminal,
    isNonTerminal,
    isOptional,
    stripOptional
};
