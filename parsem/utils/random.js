/* randomization utils */

import { equal } from './compare';
import { range } from './core';
import {
    check,
    suite,
    test
} from './test';


/**
 * shuffle : Array => Array
 * ========================
 * Return a shuffled copy of an array.
 *
 * @param {Array} arr - the array to shuffle.
 */
function shuffle(arr) {
    // make a copy of the array
    const arrCopy = arr.slice();
    const arrLength = arrCopy.length;
    // shuffle the copy of the array in place using Fisher-Yates
    for (let i = arrLength - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = arrCopy[i];
        const y = arrCopy[j];
        arrCopy[i] = y;
        arrCopy[j] = x;
    }
    return arrCopy;
}
suite('random', [
    test('shuffle', function () {
        check(
            "shuffle should shuffle the empty list.",
            equal(shuffle([]), [])
        );
        check(
            "shuffle should shuffle a list of one element.",
            equal(shuffle([1]), [1])
        );
        check(
            "shuffle should shuffle lists with strings.",
            equal(
                shuffle(["a", "b"]).sort(),
                ["a", "b"]
            )
        );
        check(
            "shuffle should shuffle lists with 3 elements.",
            equal(
                shuffle([1, 2, 3]).sort(),
                [1, 2, 3]
            )
        );
        // the following tests should pass with high probability there's
        //   a 1 in 25! chance that shuffle chooses the identity
        //   permutation.
        check(
            "shuffle should (usually) not leave lists unchanged.",
            !equal(
                shuffle(range(25)),
                range(25)
            )
        );
        //   if x_ij is 1 if shuffle([0, 1, 2])[i] = j and 0 otherwise,
        //   then the expectation is E(x_ij = 1) = 1/3. By Hoeffding's
        //   inequality we have P(|E(x_ij) - x_ij| >= t) <= 2 e^{-2nt^2}
        //   so the probability that the sample average is
        //   0.3 < avg(x_{ij}) < 0.4 is at least 1 - 10^{-9}.
        check(
            "shuffle should choose a permutation uniformly.",
            (() => {
                const counts = [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]
                ];
                const iterations = 10000
                for (let i = 0; i < iterations; i++) {
                    const sample = shuffle([0, 1, 2]);
                    counts[0][sample[0]] += 1;
                    counts[1][sample[1]] += 1;
                    counts[2][sample[2]] += 1;
                }

                return counts
                    .map(row => row.map(n => n / iterations))
                    .every(row => row.every(n => 0.3 < n && n < 0.4));
            })()
        );
    })
]);


export {
    shuffle
};
