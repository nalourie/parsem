/* rankers for some of the built-in parsers. */

import {
    arithmeticParser
} from '../parsers/arithmetic';
import {
    digitParser,
    numberParser,
    ordinalParser
} from '../parsers/numbers';
import {
    ignorableParser
} from '../parsers/ignore';
import {
    parseCountsFeaturizer,
    parsePrecedenceFeaturizer,
    parseDepthsFeaturizer,
    parseLengthsFeaturizer,
    ConcatFeaturizer
} from '../rank/featurize';
import {
    ConstantRanker,
    LinearRanker
} from '../rank/ranker';


/**
 * arithmeticLinearRanker
 * ======================
 * A parse re-ranker for arithmeticParser.
 */
const arithmeticLinearRanker = new LinearRanker(
    new ConcatFeaturizer([
        parsePrecedenceFeaturizer,
        parseLengthsFeaturizer
    ]),
    {},
    arithmeticParser
);


/**
 * digitConstantRanker
 * ===================
* A parse re-ranker for digitParser.
*/
const digitConstantRanker = new ConstantRanker(null, {}, digitParser);


/**
 * numberLinearRanker
 * ==================
 * A parse re-ranker for numberParser.
 */
const numberLinearRanker = new LinearRanker(
    new ConcatFeaturizer([
        parseCountsFeaturizer,
        parsePrecedenceFeaturizer,
        parseDepthsFeaturizer
    ]),
    {},
    numberParser
);


/**
 * ordinalLinearRanker
 * ===================
 * A parse re-ranker for ordinalParser.
 */
const ordinalLinearRanker = new LinearRanker(
    new ConcatFeaturizer([
        parseCountsFeaturizer,
        parsePrecedenceFeaturizer,
        parseDepthsFeaturizer
    ]),
    {},
    ordinalParser
);


/**
 * ignorableConstantRanker
 * =======================
 * A parse re-ranker for ignorableParser.
 */
const ignorableConstantRanker = new ConstantRanker(null, {}, ignorableParser);


export {
    arithmeticLinearRanker,
    digitConstantRanker,
    numberLinearRanker,
    ordinalLinearRanker,
    ignorableConstantRanker
};
