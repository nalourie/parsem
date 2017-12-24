/* parsers for parsing numbers. */

import {
    check,
    suite,
    test
} from '../utils/test';
import { Parse, Parser } from '../parse/parse';

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
        super(span, "$Number", span, [], semantics);

        // methods

        // attributes
    }
}


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
        super(roots)

        // methods

        this.parse = (s, roots = this.roots) => {
            const num = parseFloat(s);
            return isNaN(num) ? [] : [new NumberParse(s, () => num)];
        }

        // attributes
    }
}
const digitParser = new DigitParser(["$Number"]);
suite('numbers', [
    test('digitParser.parse', function () {
        check(
            "digitParser.parse should produce only one parse for an integer.",
            digitParser.parse("12").length === 1
        );
        check(
            "digitParser.parse should correctly parse an integer.",
            digitParser.parse("12")[0].computeDenotation() === 12
        );
        check(
            "digitParser.parse should produce only one parse for a decimal.",
            digitParser.parse("12.643").length === 1
        );
        check(
            "digitParser.parse should correctly parse a decimal.",
            digitParser.parse("12.643")[0].computeDenotation() === 12.643
        );
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
        check(
            "digitParser.parse should handle commas.",
            digitParser.parse("12,000").length === 1
        );
        check(
            "digitParser.parse should parse integers with commas.",
            digitParser.parse("12,000")[0].computeDenotation() === 12000
        );
    })
]);


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
            'rootPositive',
            '$Number', '$Num',
            x => x
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
        check(
            "numberParser.parse should correctly parse one.",
            numberParser.parse("one")[0].computeDenotation() === 1
        );
        check(
            "numberParser.parse should correctly parse two.",
            numberParser.parse("two")[0].computeDenotation() === 2
        );
        check(
            "numberParser.parse should correctly parse three.",
            numberParser.parse("three")[0].computeDenotation() === 3
        );
        check(
            "numberParser.parse should correctly parse five.",
            numberParser.parse("five")[0].computeDenotation() === 5
        );
        check(
            "numberParser.parse should correctly parse thirteen.",
            numberParser.parse("thirteen")[0].computeDenotation() === 13
        );
        check(
            "numberParser.parse should correctly parse sixty three.",
            numberParser.parse("sixty three")[0].computeDenotation() === 63
        );
        check(
            "numberParser.parse should correctly parse one hundred.",
            numberParser.parse("one hundred")[0].computeDenotation() === 100
        );
        check(
            "numberParser.parse should correctly parse a hundred.",
            numberParser.parse("a hundred")[0].computeDenotation() === 100
        );
        check(
            "numberParser.parse should correctly parse three hundred sixty five.",
            numberParser.parse("three hundred sixty five")[0].computeDenotation() === 365
        );
        check(
            "numberParser.parse should correctly parse one thousand two hundred and seventy six.",
            numberParser.parse("one thousand two hundred and seventy six")[0].computeDenotation() === 1276
        );
        check(
            "numberParser.parse should correctly parse a hundred and thirty two.",
            numberParser.parse("a hundred and thirty two")[0].computeDenotation() === 132
        );
        check(
            "numberParser.parse should correctly parse negative thirty five.",
            numberParser.parse("negative thirty five")[0].computeDenotation() === -35
        );
        check(
            "numberParser.parse should correctly parse five thousand two hundred.",
            numberParser.parse("five thousand two hundred")[0].computeDenotation() === 5200
        );
        check(
            "numberParser.parse should correctly parse five thousand and two hundred sixty two.",
            numberParser.parse("five thousand and two hundred sixty two")[0].computeDenotation() === 5262
        );
    })
]);


export {
    NumberParse,
    DigitParser,
    digitParser,
    numberParser
};
