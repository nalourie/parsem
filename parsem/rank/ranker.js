/* rankers for ranking parses. */

import {
    AbstractClassError,
    NotImplementedError
} from '../utils/abstract';
import { assert } from '../utils/assert';
import { equal } from '../utils/compare';
import { range } from '../utils/core';
import { shuffle } from '../utils/random';


/**
 * Ranker
 * ======
 * A ranker ranks parses.
 *
 * `Ranker` is an abstract base class. Inherit from `Ranker` to create a
 * Ranker class.
 *
 * Methods
 * -------
 * score : Parse -> Number
 *   Return a score for a parse giving the probability of the parse.
 *
 *   @param {Parse} parse - the parse to score.
 *
 * fit : Array[String] Array[Any] -> undefined
 *   Fit the ranker to the data in data and labels.
 *
 *   @param {Array[String]} utterances - an array of strings
 *     representing utterances.
 *   @param {Array[Any]} denotations - an array of data representing the
 *     denotations of the utterances in data.
 *
 * rankedParses : String -> Array[(Number, Parse)]
 *   Return a sorted list of (score, parse) pairs, with the best parse
 *     first.
 *
 *   @param {String} s - the string to parse.
 *
 * topParse : String -> Parse
 *   Return the top parse for a string.
 *
 *   @param {String} s - the string to parse.
 *
 * Attributes
 * ----------
 * featurizer : Featurizer
 *   The featurizer to produce parse features.
 *
 * weights : {String: Number}
 *   Object mapping feature strings to their corresponding weights.
 *
 * parser : Parser
 *   The parser to parse the utterances.
 */
class Ranker {
    // any weight not specified is assumed zero
    constructor(featurizer, weights, parser) {
        if (this.constructor === Ranker) {
            throw new AbstractClassError(
                "Ranker is an abstract class. It should not be instantiated."
            );
        }

        this.featurizer = featurizer;
        this.weights = weights;
        this.parser = parser;

        this.score = (parse) => {
            throw new NotImplementedError(
                "Ranker subclasses must implement a score method."
            );
        }

        this.fit = (utterances, denotations) => {
            throw new NotImplementedError(
                "Ranker subclasses must implement a fit method."
            );
        }

        this.rankedParses = (s) => {
            return this.parser.parse(s)
                .map(p => [this.score(p), p])
                .sort((a, b) => b[0] - a[0])
        }

        this.topParse = (s) => {
            return this.rankedParses(s)[0][1]
        }
    }
}


/**
 * ConstantRanker
 * ==============
 * A ranker that scores all parses equally.
 *
 * `ConstantRanker` scores all parses equally. It's useful for wrapping
 * parsers which don't require rankers when you just want a uniform
 * interface.
 *
 * See `Ranker` for details.
 */
class ConstantRanker extends Ranker {
    constructor(featurizer, weights, parser) {
        super(featurizer, weights, parser);

        this.score = (parse) => 0;

        this.fit = (utterances, denotations) => {};
    }
}


/**
 * LinearRanker
 * ============
 * Use linear regression to rank parses.
 *
 * See `Ranker` for details.
 */
class LinearRanker extends Ranker {
    constructor(featurizer, weights, parser) {
        super(featurizer, weights, parser);

        this.score = (parse) => {
            const features = this.featurizer.transform(parse);
            let output = 0;

            for (let feature in features) {
                const weight = this.weights[feature] || 0;
                output += weight * features[feature];
            }

            return output;
        }

        this.fit = (utterances, denotations) => {
            assert(
                utterances.length === denotations.length,
                "utterances and denotations must be of the same length."
            );
            const numSamples = utterances.length;

            // hyperparams
            const maxEpochs = 100;
            const tol = 1e-2;
            const learningRate = 1e-2;
            const regularization = 1e-2;
            const alpha = 1;

            for (let epoch = 0; epoch < maxEpochs; epoch++) {
                const oldLoss = curLoss || Infinity;
                let curLoss = 0;

                // randomly shuffle the data
                const epochOrder = shuffle(range(numSamples));
                const updateTimes = {};

                // we need i after the loop ends to apply regularization.
                let i;
                for (i = 0; i < utterances.length; i++) {
                    const utterance = utterances[epochOrder[i]];
                    const denotation = denotations[epochOrder[i]];

                    const grad = {};

                    // create [score, correct, parse] triples
                    const scoredParses = this.parser
                          .parse(utterance)
                          .map(p => [
                              this.score(p),
                              equal(p.computeDenotation(), denotation),
                              p
                          ]);

                    // find best correct parse and other close parses
                    const [correctScore, _, correctParse] = scoredParses
                          .filter(([score, correct, p]) => correct)
                          .reduce((acc, v) => v[0] > acc[0] ? v : acc);
                    const topScoredParses = scoredParses
                          .filter(([score, correct, p]) => {
                              return !correct && correctScore - score < alpha;
                          });

                    // update loss:
                    //
                    //   sum_{p} max(score(p) + alpha - correctScore, 0)
                    //
                    // where p ranges over all parses with incorrect denotations.
                    curLoss += topScoredParses
                        .map(([score, correct, p]) => {
                            return Math.max(
                                score + alpha - correctScore,
                                0
                            );
                        })
                        .reduce((a, b) => a + b, 0)

                    topScoredParses.forEach(([score, correct, p]) => {
                        const topFeatures = this.featurizer
                              .transform(p);
                        const correctFeatures = this.featurizer
                              .transform(correctParse);
                        const features = new Set(
                            Object.keys(topFeatures).concat(
                                Object.keys(correctFeatures)
                            )
                        );

                        for (let feature of features) {
                            if (!grad.hasOwnProperty(feature)) {
                                grad[feature] = 0;
                            }
                            grad[feature] += (
                                (topFeatures[feature] || 0)
                                    - (correctFeatures[feature] || 0)
                            );
                        }
                    });

                    // apply the gradient update to the weights
                    for (let feature in grad) {
                        if (!this.weights.hasOwnProperty(feature)) {
                            this.weights[feature] = 0;
                        }

                        const regularizationFactor = (
                            1 - learningRate * regularization
                        ) ** (i - (updateTimes[feature] || 0));

                        // apply the regularization lazily
                        this.weights[feature] *= regularizationFactor;

                        // update with the gradient
                        this.weights[feature] -= learningRate * grad[feature];

                        updateTimes[feature] = i;
                    }
                }
                // apply any unapplied regularization
                for (let feature in this.weights) {
                    const regularizationFactor = (
                        1 - learningRate * regularization
                    ) ** (i - (updateTimes[feature] || 0));

                    this.weights[feature] *= regularizationFactor;
                }

                // check the tolerance
                if (Math.abs(curLoss - oldLoss) <= tol) {
                    return
                }
            }
        }
    }
}


export {
    Ranker,
    ConstantRanker,
    LinearRanker
};
