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
    arithmeticSoftmaxRanker,
    digitConstantRanker,
    numberLinearRanker,
    numberSoftmaxRanker,
    ordinalLinearRanker,
    ordinalSoftmaxRanker,
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
        "rankers": {
            "linear": arithmeticLinearRanker,
            "softmax": arithmeticSoftmaxRanker
        },
        "description": "Execute natural language arithmetic expressions.",
        "example": "How much is seven times three?",
        "data": arithmeticData
    },
    "digits": {
        "parser": digitParser,
        "rankers": {"constant": digitConstantRanker},
        "description": "Parse numbers expressed in digits.",
        "example": "12,034",
        "data": digitData
    },
    "numbers": {
        "parser": numberParser,
        "rankers": {
            "linear": numberLinearRanker,
            "softmax": numberSoftmaxRanker
        },
        "description": "Parse numbers expressed in words.",
        "example": "one thousand twenty two",
        "data": numberData
    },
    "ordinals": {
        "parser": ordinalParser,
        "rankers": {
            "linear": ordinalLinearRanker,
            "softmax": ordinalSoftmaxRanker
        },
        "description": "Parse ordinal numbers expressed in words",
        "example": "thirty third",
        "data": ordinalData
    },
    "ignorables": {
        "parser": ignorableParser,
        "rankers": {"constant": ignorableConstantRanker},
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
