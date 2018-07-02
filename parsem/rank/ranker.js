/* rankers for ranking parses. */

import {
    AbstractClassError,
    NotImplementedError
} from '../utils/abstract';
import { assert } from '../utils/assert';
import { equal } from '../utils/compare';
import { range, groupBy } from '../utils/core';
import { shuffle } from '../utils/random';


/**
 * Ranker
 * ======
 * A ranker ranks parses and denotations.
 *
 * `Ranker` is an abstract base class. Inherit from `Ranker` to create a
 * Ranker class. Rankers produce scores for all the parses or all the
 * denotations produced by a parser.
 *
 * Note that the scores are not necessarily probabilities and only must
 * satisfy that higher scores mean better parses or denotations.
 * Similarly, the denotation scores are not necessarily comparable to
 * the individual parse scores and how they're computed depends on the
 * ranker.
 *
 * Subclasses must implement the `fit`, `scoresAndParses`, and
 * `scoresAndDenotations` methods in whatever way makes the most sense
 * for that particular model.
 *
 * Methods
 * -------
 * fit : Array[String] Array[Any] -> undefined
 *   Fit the ranker to the utterances and denotations.
 *
 *   @param {Array[String]} utterances - an array of strings
 *     representing utterances.
 *   @param {Array[Any]} denotations - an array of data representing the
 *     denotations of the utterances.
 *
 * scoresAndParses : String -> Array[(Number, Parse)]
 *   Return a sorted list of (score, parse) pairs, with the best parse
 *     first.
 *
 *   @param {String} s - the string to parse.
 *
 * scoresAndDenotations : String -> Array[(Number, Any)]
 *   Return a sorted list of (score, denotation) pairs, with the best
 *     denotation first.
 *
 *   @param {String} s - the string for which to compute denotations.
 *
 * topParse : String -> Parse
 *   Return the top parse for a string.
 *
 *   @param {String} s - the string to parse.
 *
 * topDenotation : String -> Any
 *   Return the top denotation for a string.
 *
 *   @param {String} s - the string for which to compute denotations.
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
                "Ranker is an abstract class. It should not be"
                  + " instantiated."
            );
        }

        this.featurizer = featurizer;
        this.weights = weights;
        this.parser = parser;

        this.fit = (utterances, denotations) => {
            throw new NotImplementedError(
                "Ranker subclasses must implement a fit method."
            );
        }

        this.scoresAndParses = (s) => {
            throw new NotImplementedError(
                "Ranker subclasses must implement a scoresAndParses"
                  + " method."
            );
        }

        this.scoresAndDenotations = (s) => {
            throw new NotImplementedError(
                "Ranker subclasses must implement a"
                  + " scoresAndDenotations method."
            );
        }

        this.topParse = (s) => {
            return this.scoresAndParses(s)[0][1];
        }

        this.topDenotation = (s) => {
            return this.scoresAndDenotations(s)[0][1];
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

        this.fit = (utterances, denotations) => {};

        this.scoresAndParses = (s) => {
            return this.parser.parse(s)
                .map(p => [0, p]);
        }

        this.scoresAndDenotations = (s) => {
            return this.parser.parse(s)
                .map(p => [0, p.computeDenotation()]);
        }
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

        // create a private function which produces the score
        const getScore = (parse) => {
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
                              getScore(p),
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

        this.scoresAndParses = (s) => {
            return this.parser.parse(s)
                .map(p => [getScore(p), p])
                .sort((a, b) => b[0] - a[0]);
        }

        this.scoresAndDenotations = (s) => {
            // compute scores for each parse and the corresponding
            // denotation for that parse, without aggregating the
            // denotation scores
            const scoredParseDenotations = this.scoresAndParses(s)
                  .map(([score, p]) => [score, p.computeDenotation()]);

            // aggregate the denotation's scores
            const scoredDenotations = Array.from(
                groupBy(
                    ([score, denotation]) => denotation,
                    scoredParseDenotations))
                .map(([denotation, scoreAndDenotationPairs]) => [
                    scoreAndDenotationPairs.reduce(
                        (acc, [score, denotation]) => Math.max(acc, score),
                        -Infinity
                    ),
                    denotation
                ])
                .sort((a, b) => b[0] - a[0]);

            return scoredDenotations;
        }
    }
}


/**
 * SoftmaxRanker
 * =============
 * Use a softmax and marginal likelihood to rank parses.
 *
 * This ranker predicts the probability that a parse is correct by a
 * softmax over the features for all the produced parses. This ranker is
 * trained on denotations using SGD on the marginal likelihood of the
 * correct denotation.  The loss is negative log-likelihood
 * (cross-entropy) with l2 regularization.
 *
 * The scores returned for the parses and denotations are
 * (uncalibrated) probability scores.
 *
 * See `Ranker` for details.
 */
class SoftmaxRanker extends Ranker {
    constructor(featurizer, weights, parser) {
        super(featurizer, weights, parser);

        // create a private function which produces the unnormalized
        // probability for a parse
        const getExpScore = (parse) => {
            const features = this.featurizer.transform(parse);
            let logit = 0;

            for (let feature in features) {
                const weight = this.weights[feature] || 0;
                logit += weight * features[feature];
            }

            return Math.exp(logit);
        }

        this.fit = (utterances, denotations) => {
            assert(
                utterances.length === denotations.length,
                "utterances and denotations must be of the same length."
            );
            const numSamples = utterances.length;

            /**
             * The ranker predicts logits from a linear function of the
             * parse features, which when put through a softmax gives
             * probabilities:
             *
             *   x_i // parse features
             *   p_i = e^{W^T x_i} / \sum_{j=1}^{J} e^{W^T x_j}
             *
             * Since there are no fixed classes, adding a bias term
             * doesn't make sense in this context. The learning
             * objective is the l2 regularized negative log-likelihood
             * for the correct denotation which we obtain by
             * marginalizing out all the incorrect denotations:
             *
             *   p_d = \sum_{d=1}^D p_{i_d}
             *
             * Where $i_d$ indexes over parses with the correct
             * denotation. The gradient is then:
             *
             *   \partial - \log(p_d) / \partial w_j =
             *     - 1 / p_d (
             *       \sum_{d=1}^D p_{i_d} (x_{i_d j}
             *       - \sum_{j=1}^J p_j x_{jk})
             *     )
             *
             * Where $x_{ij}$ denotes the j'th element of vector
             * $x_i$. We apply the regularization separately in the
             * standard weight decay style.
             */

            // hyperparams
            const maxEpochs = 100;
            const tol = 1e-4;
            const learningRate = 1e-3;
            const regularization = 1e-3;

            // run the training epochs
            for (let epoch = 0; epoch < maxEpochs; epoch++) {
                // track the loss for the epoch vs the previous epoch
                const oldLoss = curLoss || Infinity;
                let curLoss = 0;

                // randomly shuffle the data
                const epochOrder = shuffle(range(numSamples));
                const updateTimes = {};

                // we need i after the loop ends to apply regularization.
                let i;
                for (i = 0; i < numSamples; i++) {
                    const utterance = utterances[epochOrder[i]];
                    const denotation = denotations[epochOrder[i]];

                    // create [prob, features, correct, parse] tuples

                    const expScoredParses = this.parser
                          .parse(utterance)
                          .map(p => [
                              getExpScore(p),
                              this.featurizer.transform(p),
                              equal(p.computeDenotation(), denotation),
                              p
                          ]);

                    const normalizer = expScoredParses
                          .reduce((acc, v) => acc + v[0], 0.0);

                    // create the probability scored tuples
                    const probScoredParses = expScoredParses
                          .map(([expScore, features, correct, p]) => [
                              expScore / normalizer,
                              features,
                              correct,
                              p
                          ]);

                    // compute the probability of the correct denotation
                    const denotationProb = probScoredParses
                          .filter(([probScore, features, correct, p]) => correct)
                          .reduce((acc, v) => acc + v[0], 0.0);

                    // update the loss, i.e. the negative log likelihood
                    // of the denotation
                    curLoss += - Math.log(denotationProb);

                    // construct the gradient

                    // compute the average feature vector
                    const averageFeatures = {}
                    probScoredParses.forEach(([probScore, features, correct, p]) => {
                        for (let feature in features) {
                            if (!averageFeatures.hasOwnProperty(feature)) {
                                averageFeatures[feature] = 0;
                            }
                            averageFeatures[feature] += probScore * features[feature];
                        }
                    });

                    // compute the gradient
                    const grad = {};
                    probScoredParses
                        .filter(([probScore, features, correct, p]) => correct)
                        .forEach(([probScore, features, correct, p]) => {
                            for (let feature in features) {
                                if (!grad.hasOwnProperty(feature)) {
                                    grad[feature] = 0;
                                }
                                grad[feature] += - (1 / denotationProb)
                                    * probScore
                                    * (features[feature] - averageFeatures[feature]);
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

        this.scoresAndParses = (s) => {
            const expScoredParses = this.parser.parse(s)
                .map(p => [getExpScore(p), p]);
            const normalizer = expScoredParses
                  .reduce((acc, [expScore, p]) => acc + expScore, 0);

            return expScoredParses
                .map(([score, p]) => [score / normalizer, p])
                .sort((a, b) => b[0] - a[0]);
        }

        this.scoresAndDenotations = (s) => {
            // compute scores for each parse and the corresponding
            // denotation for that parse, without aggregating the
            // denotation scores
            const scoredParseDenotations = this.scoresAndParses(s)
                  .map(([score, p]) => [score, p.computeDenotation()]);

            // aggregate the denotation's scores
            const scoredDenotations = Array.from(
                groupBy(
                    ([score, denotation]) => denotation,
                    scoredParseDenotations))
                .map(([denotation, scoreDenotationPairs]) => [
                    scoreDenotationPairs.reduce(
                        (acc, [score, denotation]) => acc + score,
                        0
                    ),
                    denotation
                ])
                .sort((a, b) => b[0] - a[0]);

            return scoredDenotations;
        }
    }
}


export {
    Ranker,
    ConstantRanker,
    LinearRanker,
    SoftmaxRanker
};
