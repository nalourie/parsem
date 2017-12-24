/* parsers for parsing numbers. */

import {
    check,
    suite,
    test
} from '../utils/test';
import { Parse, Parser, checkParser } from '../parse/parse';

import { basicTokenizer } from '../tokenize/tokenize';
import { Rule } from '../grammar/rule';
import { Grammar } from '../grammar/grammar';


/**
 * NumberParse
 * ===========
 * A parse representing a number.
 *
 * See `Parse` for methods and attributes.
 */
class NumberParse extends Parse {
    constructor(span,  semantics) {
        super("number", "$Number", span, [], semantics);

        // methods

        // attributes
    }
}


/**
 * digitData : Array[(String, Int)]
 * ================================
 * An array of data for parsing digits.
 *
 * `digitData` contains utterance - denotation pairs for strings
 * representing numbers written out using digits.
 */
const digitData = [
    // integers
    ["1", 1],
    ["12", 12],
    ["1235", 1235],
    // decimals
    ["12.643", 12.643],
    ["1.01", 1.01],
    ["1.", 1],
    // numbers with commas
    ["12,000", 12000]
];


/**
 * DigitParser
 * ===========
 * A parser for parsing numbers represented by digits.
 *
 * `DigitParser` can parse input such as `12` or `25.3`.
 *
 * Methods
 * -------
 * parse : String Optional[[String]] -> [NumberParse]
 *   Convert a string to a list of number parses. If the string is not
 *   formed of digits, then `parse` will return the empty list.
 */
class DigitParser extends Parser {
    constructor(roots) {
        super(roots);

        // methods

        this.parse = (s, roots = this.roots) => {
            let parses;
            if (this.numRegex.test(s)) {
                const num = parseFloat(s.replace(',', ''));
                parses = [new NumberParse(s, () => num)];
            } else {
                parses = [];
            }
            return parses;
        }

        // attributes

        // match numers that either are in comma separated form or have
        // no commas, and that optionally have a decimal point, and
        // optionally have a punction mark (.,?!;) at the end.
        this.numRegex = /^(\d{1,3}(\,\d{3})*|\d+)?(\.\d*)?[.,?!;]?$/
    }
}
const digitParser = new DigitParser(["$Number"]);
suite('numbers', [
    test('digitParser.parse', function () {
        // check that digitParser rejects certain non-numbers
        check(
            "digitParser.parse should not parse numbers with trailing characters.",
            digitParser.parse("12a").length === 0
        );
        check(
            "digitParser.parse should not parse numbers with leading characters.",
            digitParser.parse("b12").length === 0
        );
        check(
            "digitParser.parse should not parse numbers with spaces.",
            digitParser.parse("12 1").length === 0
        );
        check(
            "digitParser.parse should not parse non-numbers.",
            digitParser.parse("foo").length === 0
        );
        // check digitParser on digitData
        checkParser(
            'digitParser',
            digitParser,
            digitData,
            1
        );
    })
]);


/**
 * numberData : Array[(String, Int)]
 * =================================
 * An array of data for parsing numbers.
 *
 * `numberData` contains utterance - denotation pairs for strings
 * representing numbers written out using natural language.
 */
const numberData = [
    ["one", 1],
    ["two", 2],
    ["three", 3],
    ["five", 5],
    ["thirteen", 13],
    ["sixty three", 63],
    ["one hundred", 100],
    ["a hundred", 100],
    ["three hundred sixty five", 365],
    ["one thousand two hundred and seventy six", 1276],
    ["a hundred and thirty two", 132],
    ["negative thirty five", -35],
    ["five thousand two hundred", 5200],
    ["five thousand and two hundred sixty two", 5262],
];


/**
 * NumberParser
 * ============
 * A parser for numbers written as text.
 *
 * `NumberParser` can parse inputs such as `one` or `one hundred seventy
 * six`.
 */
const numberParser = new Grammar(
    ["$Number"],
    basicTokenizer,
    [],
    [
        // define the root symbols
        new Rule(
            'root',
            '$Number', '$Num',
            x => x
        ),
        new Rule(
            'rootPostive',
            '$Number', 'positive $Num',
            (x, y) => y
        ),
        new Rule(
            'rootNegative',
            '$Number', 'negative $Num',
            (x, y) => -y
        ),
        // special case lexical rules
        new Rule(
            'a',
            '$Article', 'a',
            () => null
        ),
        new Rule(
            'an',
            '$Article', 'an',
            () => null
        ),
        // lexical rules
        new Rule(
            'zero',
            '$Num', 'zero',
            () => 0
        ),
        new Rule(
            'one',
            '$Num', 'one',
            () => 1
        ),
        new Rule(
            'two',
            '$Num', 'two',
            () => 2
        ),
        new Rule(
            'three',
            '$Num', 'three',
            () => 3
        ),
        new Rule(
            'four',
            '$Num', 'four',
            () => 4
        ),
        new Rule(
            'five',
            '$Num', 'five',
            () => 5
        ),
        new Rule(
            'six',
            '$Num', 'six',
            () => 6
        ),
        new Rule(
            'seven',
            '$Num', 'seven',
            () => 7
        ),
        new Rule(
            'eight',
            '$Num', 'eight',
            () => 8
        ),
        new Rule(
            'nine',
            '$Num', 'nine',
            () => 9
        ),
        new Rule(
            'ten',
            '$Num', 'ten',
            () => 10
        ),
        new Rule(
            'eleven',
            '$Num', 'eleven',
            () => 11
        ),
        new Rule(
            'twelve',
            '$Num', 'twelve',
            () => 12
        ),
        new Rule(
            'thirteen',
            '$Num', 'thirteen',
            () => 13
        ),
        new Rule(
            'fourteen',
            '$Num', 'fourteen',
            () => 14
        ),
        new Rule(
            'fifteen',
            '$Num', 'fifteen',
            () => 15
        ),
        new Rule(
            'sixteen',
            '$Num', 'sixteen',
            () => 16
        ),
        new Rule(
            'seventeen',
            '$Num', 'seventeen',
            () => 17
        ),
        new Rule(
            'eighteen',
            '$Num', 'eighteen',
            () => 18
        ),
        new Rule(
            'nineteen',
            '$Num', 'nineteen',
            () => 19
        ),
        new Rule(
            'twenty',
            '$Num', 'twenty',
            () => 20
        ),
        new Rule(
            'thirty',
            '$Num', 'thirty',
            () => 30
        ),
        new Rule(
            'fourty',
            '$Num', 'fourty',
            () => 40
        ),
        new Rule(
            'fifty',
            '$Num', 'fifty',
            () => 50
        ),
        new Rule(
            'sixty',
            '$Num', 'sixty',
            () => 60
        ),
        new Rule(
            'seventy',
            '$Num', 'seventy',
            () => 70
        ),
        new Rule(
            'eighty',
            '$Num', 'eighty',
            () => 80
        ),
        new Rule(
            'ninety',
            '$Num', 'ninety',
            () => 90
        ),
        new Rule(
            'hundred',
            '$Multiplier', 'hundred',
            () => 100
        ),
        new Rule(
            'thousand',
            '$Multiplier', 'thousand',
            () => 1000
        ),
        new Rule(
            'million',
            '$Multiplier', 'million',
            () => 1000000
        ),
        new Rule(
            'billion',
            '$Multiplier', 'billion',
            () => 1000000000
        ),
        // compositional
        new Rule(
            'addNums',
            '$Num', '$Num ?and $Num',
            (x, y, z) => x + z
        ),
        new Rule(
            'numberMultiply',
            '$Num', '$Num $Multiplier',
            (x, y) => x * y
        ),
        new Rule(
            'aMultiply',
            '$Num', '$Article $Multiplier',
            (x, y) => 1 * y
        )
    ]
);
suite('numbers', [
    test('numberParser.parse', function () {
        checkParser(
            'numberParser',
            numberParser,
            numberData,
            10
        );
    })
]);


/**
 * ordinalData : Array[(String, Int)]
 * ==================================
 * An array of data for parsing ordinals.
 *
 * `ordinalData` contains utterance - denotation pairs for strings
 * representing ordinals written out using natural language.
 */
const ordinalData = [
    ["first", 1],
    ["second", 2],
    ["third", 3],
    ["fifth", 5],
    ["thirteenth", 13],
    ["sixty third", 63],
    ["one hundredth", 100],
    ["a hundredth", 100],
    ["three hundred sixty fifth", 365],
    ["one thousand two hundred and seventy sixth", 1276],
    ["a hundred and thirty second", 132],
    ["negative thirty fifth", -35],
    ["five thousand two hundredth", 5200],
    ["five thousand and two hundred sixty second", 5262]
];


/**
 * ordinalParser
 * =============
 * A parser for ordinal numbers written as text.
 *
 * `ordinalParser` can parse inputs such as `first` or `twenty fifth`.
 */
const ordinalParser = new Grammar(
    ["$Ordinal"],
    basicTokenizer,
    [numberParser],
    [
        // define the root symbols
        new Rule(
            'root',
            '$Ordinal', '$Ord',
            x => x
        ),
        new Rule(
            'rootPostive',
            '$Ordinal', 'positive $Ord',
            (x, y) => y
        ),
        new Rule(
            'rootNegative',
            '$Ordinal', 'negative $Ord',
            (x, y) => -y
        ),
        // lexical rules
        //   special lexical rules
        new Rule(
            'a',
            '$Article', 'a',
            () => null
        ),
        new Rule(
            'an',
            '$Article', 'an',
            () => null
        ),
        //   ordinals
        new Rule(
            'zeroth',
            '$Ord', 'zeroth',
            () => 0
        ),
        new Rule(
            'first',
            '$Ord', 'first',
            () => 1
        ),
        new Rule(
            'second',
            '$Ord', 'second',
            () => 2
        ),
        new Rule(
            'third',
            '$Ord', 'third',
            () => 3
        ),
        new Rule(
            'fourth',
            '$Ord', 'fourth',
            () => 4
        ),
        new Rule(
            'fifth',
            '$Ord', 'fifth',
            () => 5
        ),
        new Rule(
            'sixth',
            '$Ord', 'sixth',
            () => 6
        ),
        new Rule(
            'seventh',
            '$Ord', 'seventh',
            () => 7
        ),
        new Rule(
            'eighth',
            '$Ord', 'eighth',
            () => 8
        ),
        new Rule(
            'ninth',
            '$Ord', 'ninth',
            () => 9
        ),
        new Rule(
            'tenth',
            '$Ord', 'tenth',
            () => 10
        ),
        new Rule(
            'eleventh',
            '$Ord', 'eleventh',
            () => 11
        ),
        new Rule(
            'twelfth',
            '$Ord', 'twelfth',
            () => 12
        ),
        new Rule(
            'thirteenth',
            '$Ord', 'thirteenth',
            () => 13
        ),
        new Rule(
            'fourteenth',
            '$Ord', 'fourteenth',
            () => 14
        ),
        new Rule(
            'fifteenth',
            '$Ord', 'fifteenth',
            () => 15
        ),
        new Rule(
            'sixteenth',
            '$Ord', 'sixteenth',
            () => 16
        ),
        new Rule(
            'seventeenth',
            '$Ord', 'seventeenth',
            () => 17
        ),
        new Rule(
            'eighteenth',
            '$Ord', 'eighteenth',
            () => 18
        ),
        new Rule(
            'nineteenth',
            '$Ord', 'nineteenth',
            () => 19
        ),
        new Rule(
            'twentieth',
            '$Ord', 'twentieth',
            () => 20
        ),
        new Rule(
            'thirteith',
            '$Ord', 'thirtieth',
            () => 30
        ),
        new Rule(
            'fourtieth',
            '$Ord', 'fourtieth',
            () => 40
        ),
        new Rule(
            'fiftieth',
            '$Ord', 'fiftieth',
            () => 50
        ),
        new Rule(
            'sixtieth',
            '$Ord', 'sixtieth',
            () => 60
        ),
        new Rule(
            'seventieth',
            '$Ord', 'seventieth',
            () => 70
        ),
        new Rule(
            'eightieth',
            '$Ord', 'eightieth',
            () => 80
        ),
        new Rule(
            'ninetieth',
            '$Ord', 'ninetieth',
            () => 90
        ),
        new Rule(
            'hundredth',
            '$MultiplyOrd', 'hundredth',
            () => 100
        ),
        new Rule(
            'thousandth',
            '$MultiplyOrd', 'thousandth',
            () => 1000
        ),
        new Rule(
            'millionth',
            '$MultiplyOrd', 'millionth',
            () => 1000000
        ),
        new Rule(
            'billionth',
            '$MultiplyOrd', 'billionth',
            () => 1000000000
        ),
        // compositional rules
        new Rule(
            'numberAndOrdinal',
            '$Ord', '$Number ?and $Ord',
            (x, y, z) => x + z
        ),
        new Rule(
            'numberAndMultiplier',
            '$Ord', '$Number $MultiplyOrd',
            (x, y) => x * y
        ),
        new Rule(
            'articleAndOrdinal',
            '$Ord', '$Article $Ord',
            (x, y) => y
        ),
        new Rule(
            'articleAndMultiply',
            '$Ord', '$Article $MultiplyOrd',
            (x, y) => y
        )

    ]
);
suite('numbers', [
    test('ordinalParser.parse', function () {
        checkParser(
            'ordinalParser',
            ordinalParser,
            ordinalData,
            10
        );
    })
]);


export {
    NumberParse,
    DigitParser,
    digitParser,
    numberParser,
    ordinalParser
};
