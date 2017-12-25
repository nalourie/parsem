/* application logic for the parsem demo */

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


// the parsers object is used to generate the interactive demo.
window.parsers = {
    "arithmeticParser": {
        "parser": arithmeticParser,
        "description": "Execute natural language arithmetic expressions.",
        "example": "How much is seven times three?",
        "data": arithmeticData
    },
    "numberParser": {
        "parser": numberParser,
        "description": "Parse numbers expressed in words.",
        "example": "one thousand twenty two",
        "data": numberData
    },
    "ordinalParser": {
        "parser": ordinalParser,
        "description": "Parse ordinal numbers expressed in words",
        "example": "thirty third",
        "data": ordinalData
    },
    "digitParser": {
        "parser": digitParser,
        "description": "Parse numbers expressed in digits.",
        "example": "12,034",
        "data": digitData
    },
    "ignorableParser": {
        "parser": ignorableParser,
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
