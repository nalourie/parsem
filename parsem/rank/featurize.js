/* featurizers convert parses into feature vectors for ranking. */

import {
    AbstractClassError,
    NotImplementedError
} from '../utils/abstract';
import {
    check,
    suite,
    test
} from '../utils/test';

import {
    Derivation
} from '../grammar/derivation';
import {
    Rule
} from '../grammar/rule';


/**
 * Featurizer
 * ==========
 * A featurizer transforms a `Parse` instance into a feature vector.
 *
 * `Featurizer` is an abstract base class. Inherit from `Featurizer` to
 * create a Featurizer class.
 *
 * Methods
 * -------
 * transform : Parse -> {String: Number}
 *   Return an object of numbers representing features from a parse.
 *
 *   @param {Parse} parse - the parse to featurize.
 *
 * Attributes
 * ----------
 * (None)
 */
class Featurizer {
    constructor() {
        if (this.constructor === Featurizer) {
            throw new AbstractClassError(
                "Featurizer is an abstract class."
                + " It should not be instantiated."
            );
        }

        // methods

        this.transform = (parse) => {
            throw new NotImplementedError(
                "Featurizer subclasses must implement a transform method."
            );
        }

        // attributes
    }
}


/**
 * ParseCountsFeaturizer
 * =====================
 * Count the number of times different parse tags appear.
 *
 * Methods
 * -------
 * transform : Parse -> {String: Number}
 *   Return an object counting the number of times different tags appear
 *   in the parse tree.
 *
 *   @param {Parse} parse - the parse to featurize.
 *
 * Attributes
 * ----------
 * (None)
 */
class ParseCountsFeaturizer extends Featurizer {
    constructor() {
        super();

        // helper functions

        /**
         * addParseCounts : Parse Object -> undefined
         *   Add counts from `parse` into the `features`.
         *
         *   @param {Parse} parse - the parse from which to add
         *     features.
         *   @param {Object} features - the feature map to add features
         *     to.
         */
        function addParseCounts(parse, features) {
            if (!features.hasOwnProperty(parse.tag)) {
                features[parse.tag] = 0;
            }
            features[parse.tag] += 1;

            parse.children.forEach(
                child => addParseCounts(child, features)
            );
        }

        // methods

        /**
         * transform : Parse -> {String: Number}
         *   Transform a parse into an object of features.
         *
         *   @param {Parse} parse - the parse to featurize.
         */
        this.transform = (parse) => {
            const features = {};

            addParseCounts(parse, features);

            return features;
        }

        // attributes
    }
}
const parseCountsFeaturizer = new ParseCountsFeaturizer();
suite('featurize', [
    test('parseCountsFeaturizer.transform', function () {
        const fooRule = new Rule(
            'foo',
            '$foo', '$bar $bar',
            (x, y) => null
        );
        const barRule = new Rule(
            'bar',
            '$bar', 'bar',
            () => null
        );

        const features = parseCountsFeaturizer.transform(
            new Derivation(
                fooRule,
                'bar bar',
                [
                    new Derivation(barRule, 'bar', []),
                    new Derivation(barRule, 'bar', [])
                ]
            )
        );
        check(
            "parseCountsFeaturizer should count one foo.",
            features["foo"] === 1
        );
        check(
            "parseCountsFeaturizer should count two bars.",
            features["bar"] === 2
        );
    })
]);


/**
 * ParsePrecedenceFeaturizer
 * =========================
 * Create features based on which rules are applied before others.
 *
 * Methods
 * -------
 * transform : Parse -> {String: Number}
 *   Return an object counting the number of times one rule appears
 *   before another in the parse tree.
 *
 * Attributes
 * ----------
 * (None)
 */
class ParsePrecedenceFeaturizer extends Featurizer {
    constructor() {
        super();

        // helper functions

        /**
         * addParsePrecedenceFeatures : Parse Object -> undefined
         *   Add parse precedence features from `parse` to `features`.
         *
         * @param {Parse} parse - the parse from which to add the
         *   features.
         * @param {Object} features - the feature map to add features
         *   to.
         * @param {Set[String]} parseTags - the tags already
         *   encountered closer to the root of the parse tree.
         */
        function addParsePrecedenceFeatures(
            parse,
            features,
            parseTags
        ) {
            const parseTag = parse.tag;

            // add the parse tag precedence features
            for (let oldParseTag of parseTags) {
                const key = [oldParseTag, parseTag];
                if (!features.hasOwnProperty(key)) {
                    features[key] = 0;
                }
                features[key] += 1;
            }

            // add the current parse tags to the set of seen parse tags
            if (!parseTags.has(parseTag)) {
                parseTags.add(parseTag);
            }

            // clone parseTags when making the recursive call so that
            // siblings don't create precedence features for each other
            // by mutating a shared parseTags set.
            parse.children.forEach(
                child => addParsePrecedenceFeatures(
                    child,
                    features,
                    new Set(parseTags)
                )
            );
        }

        // methods

        /**
         * transform : Parse -> {String: Number}
         *   Transform a parse into an object of features.
         *
         *   @param {Parse} parse - the parse to featurize.
         */
        this.transform = (parse) => {
            const features = {};

            addParsePrecedenceFeatures(
                parse,
                features,
                new Set()
            );

            return features;
        }

        // attributes
    }
}
const parsePrecedenceFeaturizer = new ParsePrecedenceFeaturizer();
suite('featurize', [
    test('parsePrecedenceFeaturizer.transform', function () {
        const fooRule = new Rule(
            'foo',
            '$foo', '$bar $bar',
            (x, y) => null
        );
        const barRule = new Rule(
            'bar',
            '$bar', 'bar',
            () => null
        );

        const features = parsePrecedenceFeaturizer.transform(
            new Derivation(
                fooRule,
                'bar bar',
                [
                    new Derivation(barRule, 'bar', []),
                    new Derivation(barRule, 'bar', [])
                ]
            )
        );
        check(
            "features should have only one key.",
            Object.keys(features).length === 1
        );
        check(
            "features['foo,bar'] should be two.",
            features['foo,bar'] === 2
        );
    })
]);


/**
 * ParseDepthsFeaturizer
 * =====================
 * Create features based on the depths of parse tags in the tree.
 *
 * Methods
 * -------
 * transform : Parse -> {String: Number}
 *   Return an object giving the min depth that any parse tag appears
 *   at.
 *
 * Attributes
 * ----------
 * (None)
 */
class ParseDepthsFeaturizer extends Featurizer {
    constructor() {
        super();

        function addParseDepths(parse, parseDepths, depth) {
            if (!parseDepths.hasOwnProperty(parse.tag)) {
                parseDepths[parse.tag] = [];
            }
            parseDepths[parse.tag].push(depth);

            parse.children.forEach(
                child => addParseDepths(
                    child,
                    parseDepths,
                    depth + 1
                )
            );
        }

        this.transform = (parse) => {
            // aggregation function
            const aggFunc = Math.min;

            const features = {};
            const parseDepths = {};

            addParseDepths(parse, parseDepths, 0);

            for (let feature in parseDepths) {
                features[feature] = aggFunc(
                    ...parseDepths[feature]
                );
            }

            return features;
        }
    }
}
const parseDepthsFeaturizer = new ParseDepthsFeaturizer();
suite('featurize', [
    test('parseDepthsFeaturizer.transform', function () {
        const fooRule = new Rule(
            'foo',
            '$foo', '$bar $bar',
            (x, y) => null
        );
        const barRule = new Rule(
            'bar',
            '$bar', 'bar',
            () => null
        );

        const features = parseDepthsFeaturizer.transform(
            new Derivation(
                fooRule,
                'bar bar',
                [
                    new Derivation(barRule, 'bar', []),
                    new Derivation(barRule, 'bar', [])
                ]
            )
        );
        check(
            "features should have two keys.",
            Object.keys(features).length === 2
        );
        check(
            "features['foo'] should be 0.",
            features['foo'] === 0
        );
        check(
            "features['bar'] should be 1.",
            features['bar'] === 1
        );
    })
]);


/**
 * ParseLengthsFeaturizer
 * ======================
 * Create features based on the lengths of different parse types.
 *
 * Methods
 * -------
 * transform: Parse -> {String: Number}
 *   Return an object giving the length of different parses.
 *
 * Attributes
 * ----------
 * (None)
 */
class ParseLengthsFeaturizer extends Featurizer {
    constructor() {
        super();

        function addParseLengths(parse, parseLengths) {
            if (!parseLengths.hasOwnProperty(parse.tag)) {
                parseLengths[parse.tag] = [];
            }
            parseLengths[parse.tag].push(parse.span.length);

            parse.children.forEach(
                child => addParseLengths(
                    child,
                    parseLengths
                )
            );
        }

        this.transform = (parse) => {
            // aggregation function
            const aggFunc = Math.max

            const features = {};
            const parseLengths = {};

            addParseLengths(parse, parseLengths);

            for (let feature in parseLengths) {
                features[feature] = aggFunc(
                    ...parseLengths[feature]
                );
            }

            return features;
        }
    }
}
const parseLengthsFeaturizer = new ParseLengthsFeaturizer();
suite('featurize', [
    test('parseLengthsFeaturizer.transform', function () {
        const fooRule = new Rule(
            'foo',
            '$foo', '$bar $bar',
            (x, y) => null
        );
        const barRule = new Rule(
            'bar',
            '$bar', 'bar',
            () => null
        );

        const features = parseLengthsFeaturizer.transform(
            new Derivation(
                fooRule,
                'bar bar',
                [
                    new Derivation(barRule, 'bar', []),
                    new Derivation(barRule, 'bar', [])
                ]
            )
        );
        check(
            "features should have two keys.",
            Object.keys(features).length === 2
        );
        check(
            "features['foo'] should be 7.",
            features['foo'] === 7
        );
        check(
            "features['bar'] should be 3.",
            features['bar'] === 3
        );
    })
]);


/**
 * ConcatFeaturizer
 * ================
 * Concatenating features produced by other featurizers.
 *
 * Methods
 * -------
 * transform : Parse -> {String: Number}
 *   Return an object containing all features for a Parse.
 *
 * Attributes
 * ----------
 * featurizers : Array[Featurizer]
 *   featurizers from which to concatenate the features.
 */
class ConcatFeaturizer extends Featurizer {
    constructor(featurizers) {
        super();

        // methods

        this.transform = (parse) => {
            const features = {};

            for (let i = 0; i < this.featurizers.length; i++) {
                const newFeatures = this.featurizers[i]
                      .transform(parse);

                for (let feature in newFeatures) {
                    features[`${feature}_${i}`] = newFeatures[feature];
                }
            }

            return features;
        }

        // attributes

        this.featurizers = featurizers;
    }
}
const allFeaturizer = new ConcatFeaturizer([
    parseCountsFeaturizer,
    parsePrecedenceFeaturizer,
    parseDepthsFeaturizer,
    parseLengthsFeaturizer
]);
suite('featurizer', [
    test('allFeaturizer', function () {
        const fooRule = new Rule(
            'foo',
            '$foo', '$bar $bar',
            (x, y) => null
        );
        const barRule = new Rule(
            'bar',
            '$bar', 'bar',
            () => null
        );
        const features = allFeaturizer.transform(
            new Derivation(
                fooRule,
                'bar bar',
                [
                    new Derivation(barRule, 'bar', []),
                    new Derivation(barRule, 'bar', [])
                ]
            )
        );
        check(
            'features should have 7 keys.',
            Object.keys(features).length === 7
        );
        check(
            "features['foo_0'] should be 1.",
            features['foo_0'] === 1
        );
        check(
            "features['bar_0'] should be 1.",
            features['bar_0'] === 2
        );
        check(
            "features['foo,bar_1'] should be 2.",
            features['foo,bar_1'] === 2
        );
        check(
            "features['foo_2'] should be 0.",
            features['foo_2'] === 0
        );
        check(
            "features['bar_2'] should be 1.",
            features['bar_2'] === 1
        );
        check(
            "features['foo_3'] should be 7.",
            features['foo_3'] === 7
        );
        check(
            "features['bar_3'] should be 3.",
            features['bar_3'] === 3
        );
    })
]);


export {
    Featurizer,
    ParseCountsFeaturizer,
    parseCountsFeaturizer,
    ParsePrecedenceFeaturizer,
    parsePrecedenceFeaturizer,
    ParseDepthsFeaturizer,
    parseDepthsFeaturizer,
    ParseLengthsFeaturizer,
    parseLengthsFeaturizer,
    ConcatFeaturizer,
    allFeaturizer
};
