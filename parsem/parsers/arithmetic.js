/* parser for arithmetic expressions. */

import {
    check,
    suite,
    test
} from '../utils/test';
import { basicTokenizer } from '../tokenize/tokenize';
import { Rule } from '../grammar/rule';
import { Grammar } from '../grammar/grammar';
import { checkParser } from '../parse/parse';

import { ignorableParser } from './ignore';
import {
    digitParser,
    ordinalDigitParser,
    numberParser,
    ordinalParser
} from './numbers';


/**
 * arithmeticData : Array[(String, Int)]
 * =====================================
 * An array of data for natural language arithmetic.
 *
 * `arithmeticData` contains utterance - denotation pairs for natural
 * language arithmetic problems.
 */
const arithmeticData = [
    // natural language numbers
    ["one", 1],
    ["two", 2],
    ["fifty three", 53],
    // digit representations of numbers
    ["52", 52],
    ["12,000", 12000],
    // unary operations
    ["minus one", -1],
    ["minus three", -3],
    ["minus minus three", 3],
    // binary operations
    ["one plus one", 2],
    ["one plus one plus one", 3],
    ["one plus two minus three", 0],
    ["six times seven", 42],
    ["12 divided by six", 2],
    ["eight subtracted from two", -6],
    // mixed unary and binary operations
    ["one plus two minus minus three", 6],
    ["five minus minus one", 6],
    ["five minus plus one", 4],
    // langauge that has to be ignored
    ["what is five minus one", 4],
    ["What is one plus five?", 6],
    ["Three minus seven times two is how much?", -11],
    ["Say, how much is six times five?", 30],
    ["what is 43 plus 21?", 64],
    ["How about 4 plus seven?", 11],
    // left applying unary operations
    ["What is two squared?", 4],
    ["What is two cubed?", 8],
    ["What is two cubed subtracted from six?", -2],
    // powers
    ["What is 2 to the 3?", 8],
    ["What is two to the third power?", 8],
    ["What is two to the three?", 8],
    ["What is two to the power of 3?", 8],
    ["What is 4 to the second?", 16],
    ["What is 12 to the 2nd?", 144],
    ["What is 12 to the 2nd power?", 144],
    // other
    ["How much is six times three minus four?", 14],
    ["Tell me what six minus three times four is?", -6],
    ["What's five minus three to the second power?", -4],
    ["Two subtracted from eight times two.", 14],
    ["One minus two times three.", -5],
    ["How much is 2 times 3 to the 3rd plus four?", 58],
    ["What's 2 times three squared minus minus one?", 19]
]


/**
 * arithmeticParser
 * ================
 * a parser for solving natural language arithmetic problems.
 */
const arithmeticParser = new Grammar(
    ["$Root"],
    basicTokenizer,
    [digitParser, ordinalDigitParser, numberParser, ordinalParser, ignorableParser],
    [
        // define a valid parse
        new Rule(
            'root',
            '$Root', '?$Ignorable $Expr ?$Ignorable',
            (x, y, z) => y
        ),
        // expressions can be numbers
        new Rule(
            'exprToNumber',
            '$Expr', '$Number',
            x => x
        ),
        //  unary prefix operations
        new Rule(
            'unaryPrefixPlus',
            '$UnaryPrefixOp', 'plus',
            () => x => x
        ),
        new Rule(
            'unaryPrefixMinus',
            '$UnaryPrefixOp', 'minus',
            () => x => -x
        ),
        // unary postfix operations
        new Rule(
            'unaryPostfixSquared',
            '$UnaryPostfixOp', 'squared',
            () => x => x ** 2
        ),
        new Rule(
            'unaryPostfixCubed',
            '$UnaryPostfixOp', 'cubed',
            () => x => x ** 3
        ),
        // binary operations
        //   addition
        new Rule(
            'binaryPlus',
            '$BinaryOp', 'plus',
            () => (x, y) => x + y
        ),
        new Rule(
            'binaryPlus',
            '$BinaryOp', 'added to',
            () => (x, y) => x + y
        ),
        //   subtraction
        new Rule(
            'binaryMinus',
            '$BinaryOp', 'minus',
            () => (x, y) => x - y
        ),
        new Rule(
            'binaryMinus',
            '$BinaryOp', 'subtracted from',
            () => (x, y) => y - x
        ),
        //   multiplication
        new Rule(
            'binaryTimes',
            '$BinaryOp', 'times',
            () => (x, y) => x * y
        ),
        new Rule(
            'binaryTimes',
            '$BinaryOp', 'multiplied by',
            () => (x, y) => x * y
        ),
        //   division
        new Rule(
            'binaryTimes',
            '$BinaryOp', 'divided by',
            () => (x, y) => x / y
        ),
        new Rule(
            'binaryTimes',
            '$BinaryOp', 'over',
            () => (x, y) => x / y
        ),
        // composition rules
        new Rule(
            'unaryPrefixApplication',
            '$Expr', '$UnaryPrefixOp $Expr',
            (x, y) => x(y)
        ),
        new Rule(
            'unaryPostfixApplication',
            '$Expr', '$Expr $UnaryPostfixOp',
            (x, y) => y(x)
        ),
        new Rule(
            'binaryApplication',
            '$Expr', '$Expr $BinaryOp $Expr',
            (x, y, z) => y(x, z)
        ),
        // adhoc rules
        //   powers
        new Rule(
            'power',
            '$Expr', '$Expr to the $Expr ?power',
            (v, w, x, y, z) => v ** y
        ),
        new Rule(
            'powerOrdinal',
            '$Expr', '$Expr to the $Ordinal ?power',
            (v, w, x, y, z) => v ** y
        ),
        new Rule(
            'powerOf',
            '$Expr', '$Expr to the power of $Expr',
            (u, v, w, x, y, z) => u ** z
        )
    ]
);
suite('arithmetic', [
    test('arithmeticParser.parse', function () {
        checkParser(
            "arithmeticParser",
            arithmeticParser,
            arithmeticData,
            25
        );
    })
]);


export {
    arithmeticData,
    arithmeticParser
};
