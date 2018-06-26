/* application logic for the parsem demo */

import {
    accuracy
} from '../parsem/eval/eval';
import {
    arithmeticData,
    arithmeticParser
} from '../parsem/parsers/arithmetic';
import {
    digitData,
    digitParser,
    numberData,
    numberParser,
    ordinalData,
    ordinalParser
} from '../parsem/parsers/numbers';
import {
    ignorableData,
    ignorableParser
} from '../parsem/parsers/ignore';
import {
    arithmeticLinearRanker,
    digitConstantRanker,
    numberLinearRanker,
    ordinalLinearRanker,
    ignorableConstantRanker
} from '../parsem/rankers/rankers';
import {
    shuffle
} from '../parsem/utils/random';


// attach functions and utilities required by the demo
window.accuracy = accuracy;
window.shuffle = shuffle;


// the parsers object is used to generate the interactive demo.
window.parsers = {
    "arithmetic": {
        "parser": arithmeticParser,
        "ranker": arithmeticLinearRanker,
        "description": "Execute natural language arithmetic expressions.",
        "example": "How much is seven times three?",
        "data": arithmeticData
    },
    "digits": {
        "parser": digitParser,
        "ranker": digitConstantRanker,
        "description": "Parse numbers expressed in digits.",
        "example": "12,034",
        "data": digitData
    },
    "numbers": {
        "parser": numberParser,
        "ranker": numberLinearRanker,
        "description": "Parse numbers expressed in words.",
        "example": "one thousand twenty two",
        "data": numberData
    },
    "ordinals": {
        "parser": ordinalParser,
        "ranker": ordinalLinearRanker,
        "description": "Parse ordinal numbers expressed in words",
        "example": "thirty third",
        "data": ordinalData
    },
    "ignorables": {
        "parser": ignorableParser,
        "ranker": ignorableConstantRanker,
        "description": "Parse a span in order to ignore it.",
        "example": "Hello, world!",
        "data": ignorableData
    }
}


/* run tests */

import {
    runSuites
} from '../parsem/utils/test';


// run all test suites
runSuites(/.*/);
