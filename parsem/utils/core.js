/* core utilities for javascript. */

import { equal } from './compare';
import {
    check,
    suite,
    test
} from './test';


/**
 * range : Int => Array[Int]
 * =========================
 * produce a list, 0 through len - 1.
 *
 * @param {Int} len - the length of the list to produce, or one more
 *   than the value of the final number.
 */
function range(len) {
    return Array.from(Array(len).keys());
}
suite('core', [
    test('range', function () {
        check(
            "range should produce an empty list for a value of 0.",
            equal(range(0), [])
        );
        check(
            "range should produce [0] for a value of 1.",
            equal(range(1), [0])
        );
        check(
            "range should produce [0,1,2] for a value of 3.",
            equal(range(3), [0,1,2])
        );
    })
]);


/**
 * zip : Array Array => Array
 * ==========================
 * Return an array zipping together the argument arrays.
 *
 * If arrays are of different lengths, then the resulting array will
 * have undefined where ever an array has no element in the
 * corresponding slot.
 *
 * Example:
 *
 *   > zip([0,1,2], [0, -1, -2])
 *   [ [ 0, 0 ], [ 1, -1 ], [ 2, -2 ] ]
 *   > zip([0], [1], [2])
 *   [ [0, 1, 2] ]
 *   > zip([0], [])
 *   [ [0, undefined] ]
 *
 * @param {Array} arr* - an arbitrary number of arrays to zip together.
 */
function zip(...arrs) {
    const maxLength = arrs.length > 0 ?
          Math.max(...arrs.map(arr => arr.length)) :
          0;

    return range(maxLength).map(i => arrs.map(arr => arr[i]));
}
suite('core', [
    test('zip', function () {
        check(
            "zip should zip nothing.",
            equal(
                zip(),
                []
            )
        );
        check(
            "zip should zip the empty list.",
            equal(
                zip([]),
                []
            )
        );
        check(
            "zip should zip two empty lists.",
            equal(
                zip([], []),
                []
            )
        );
        check(
            "zip should zip five empty lists.",
            equal(
                zip([], [], [], [], []),
                []
            )
        );
        check(
            "zip should zip one length one list.",
            equal(
                zip([1]),
                [[1]]
            )
        );
        check(
            "zip should zip two length one lists.",
            equal(
                zip([1], [2]),
                [[1, 2]]
            )
        );
        check(
            "zip should zip four length one lists.",
            equal(
                zip([1], [2], [3], [4]),
                [[1, 2, 3, 4]]
            )
        );
        check(
            "zip should zip one length three list.",
            equal(
                zip([1, 2, 3]),
                [[1], [2], [3]]
            )
        );
        check(
            "zip should zip two length three lists.",
            equal(
                zip([1, 2, 3], [-1, -2, -3]),
                [[1, -1], [2, -2], [3, -3]]
            )
        );
        check(
            "zip should zip four length three lists.",
            equal(
                zip(
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                    [10, 11, 12]
                ),
                [
                    [1, 4, 7, 10],
                    [2, 5, 8, 11],
                    [3, 6, 9, 12]
                ]
            )
        );
        check(
            "zip should zip uneven length lists.",
            equal(
                zip([1, 2], [3]),
                [[1, 3], [2, undefined]]
            )
        );
    })
]);


/**
 * groupBy : (V => K) Array[V] => Map[K, V]
 * ========================================
 * Return a map from keys produced by `keyFunc` to the values in `arr`.
 *
 * Group the values in `arr` using the keys produced for each value by
 * `keyFunc`, and then return a map from these keys to lists of their
 * corresponding values.
 *
 * @param {V => K} keyFunc - the function producing a key for a given
 *   value from the array.
 * @param {Array[V]} arr - The array whose elements should be grouped.
 */
function groupBy(keyFunc, arr) {
    const keyToValue = new Map();

    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        const key = keyFunc(value);

        if (!keyToValue.has(key)) {
            keyToValue.set(key, []);
        }

        keyToValue.get(key).push(value);
    }

    return keyToValue;
}
suite('core', [
    test('groupBy', function () {
        check(
            "groupBy should produce an empty map for an empty array.",
            equal(Array.from(groupBy(x => x, [])), [])
        );
        check(
            "groupBy shouldn't group unique numbers.",
            equal(
                Array.from(groupBy(x => x, [1, 2, 3])),
                [
                    [1, [1]],
                    [2, [2]],
                    [3, [3]]
                ]
            )
        );
        check(
            "groupBy should apply the key function.",
            equal(
                Array.from(groupBy(x => x - 1, [1, 2, 3])),
                [
                    [0, [1]],
                    [1, [2]],
                    [2, [3]]
                ]
            )
        );
        check(
            "groupBy should group elements with the same key.",
            equal(
                Array.from(groupBy(
                    x => x % 3,
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                )),
                [
                    [0, [0, 3, 6, 9]],
                    [1, [1, 4, 7, 10]],
                    [2, [2, 5, 8]]
                ]
            )
        );
        check(
            "groupBy should group strings correctly.",
            equal(
                Array.from(groupBy(
                    x => x[0] || "",
                    ["hi", "foo", "!", "how", "'s", "bar", "?"]
                )),
                [
                    ["h", ["hi", "how"]],
                    ["f", ["foo"]],
                    ["!", ["!"]],
                    ["'", ["'s"]],
                    ["b", ["bar"]],
                    ["?", ["?"]]
                ]
            )
        );
        check(
            "groupBy should treat functions as distinct.",
            equal(
                Array.from(groupBy(w => w, [x => x, y => y, z => z])).length,
                3
            )
        );
    })
]);


export {
    range,
    zip,
    groupBy
};
