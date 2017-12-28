/* rankers for some of the built-in parsers. */

import {
    arithmeticParser
} from '../parsers/arithmetic';
import {
    numberParser,
    ordinalParser
} from '../parsers/numbers';
import {
    parseCountsFeaturizer,
    parsePrecedenceFeaturizer,
    parseDepthsFeaturizer,
    parseLengthsFeaturizer,
    ConcatFeaturizer
} from '../rank/featurize';
import {
    LinearRanker
} from '../rank/ranker';


/**
 * arithmeticRanker
 * ================
 * A parse re-ranker for arithmeticParser.
 */
const arithmeticRanker = new LinearRanker(
    new ConcatFeaturizer([
        parsePrecedenceFeaturizer,
        parseLengthsFeaturizer
    ]),
    {},
    arithmeticParser
);


/**
 * numberRanker
 * ============
 * A parse re-ranker for numberParser.
 */
const numberRanker = new LinearRanker(
    new ConcatFeaturizer([
        parseCountsFeaturizer,
        parsePrecedenceFeaturizer,
        parseDepthsFeaturizer
    ]),
    {},
    numberParser
);


/**
 * ordinalRanker
 * =============
 * A parse re-ranker for ordinalParser.
 */
const ordinalRanker = new LinearRanker(
    new ConcatFeaturizer([
        parseCountsFeaturizer,
        parsePrecedenceFeaturizer,
        parseDepthsFeaturizer
    ]),
    {},
    ordinalParser
);


export {
    arithmeticRanker,
    numberRanker,
    ordinalRanker
};
