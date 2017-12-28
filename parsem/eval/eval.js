/* Utilities for evaluating semantic parsers. */

import {
    zip
} from '../utils/core';
import {
    equal
} from '../utils/compare';
import {
    check,
    suite,
    test
} from '../utils/test';


/**
 * logLoss : Array[Number] Array[Number] -> Number
 * ===============================================
 * Compute the cumulative log loss for using predictions on labels.
 *
 * @param {Array[Number]} preds - the predictions, numbers between 0 and
 *   1 prediction the probability that an instance is in the class.
 * @param {Array[Number]} labels - the labels, numbers that are either 0
 *   or 1, where 1 signifies the instance is a member of the class.
 */
function logLoss(preds, labels) {
    return - zip(preds, labels)
        .map(([pred, label]) => {
            return label === 1 ?
                Math.log(pred) :
                Math.log(1 - pred);
        })
        .reduce((a, b) => a + b);
}
suite('eval', [
    test('logLoss', function () {
        check(
            "logLoss should be zero for perfect predictions.",
            logLoss([1, 0, 1], [1, 0, 1]) === 0
        );
        check(
            "logLoss should compute correctly for a length 1 list.",
            (() => {
                const loss = logLoss([0.5], [1]);
                return 0.69 < loss && loss < 0.7;
            })()
        );
        check(
            "logLoss should compute correctly for a length 2 list.",
            (() => {
                const loss = logLoss([0.75, 0.5], [1, 0]);
                return 0.97 < loss && loss < 0.99;
            })()
        );
    })
]);


/**
 * accuracy : Array[Any] Array[Any] -> Number
 * ==========================================
 * Compute the percentage of correct predictions.
 *
 * @param {Array[Any]} arr1 - an array of objects (that can be compared
 *   for equality).
 * @param {Array[Any]} arr2 - an array of objects (that can be compared
 *   for equality).
 */
function accuracy(arr1, arr2) {
    return zip(arr1, arr2)
        .map(t => equal(t[0], t[1]) ? 1 : 0)
        .reduce((a, b) => a + b) / arr1.length;
}
suite('eval', [
    test('accuracy', function () {
        check(
            "accuracy should report 1 for two equal length one arrays.",
            accuracy([1], [1]) === 1
        );
        check(
            "accuracy should report 0 for two unequal length 1 arrays.",
            accuracy([1], [2]) === 0
        );
        check(
            "accuracy should report 1 for two equal arrays.",
            accuracy(['a', 'b', 'c'], ['a', 'b', 'c']) === 1
        );
        check(
            "accuracy should report 0.75 for two unequal arrays.",
            accuracy(
                ['a', 'b', 'c', 'd'],
                ['a', 'b', 'c', 'z']
            ) === 0.75
        );
    })
]);


export {
    logLoss,
    accuracy
};
