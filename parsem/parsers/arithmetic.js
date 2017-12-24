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

import { digitParser, numberParser } from './numbers';


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
    ["Three minus seven times two is how much?", -8],
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
    ["What is two to the power of 3?", 8]
]


/**
 * arithmeticParser
 * ================
 * a parser for solving natural language arithmetic problems.
 */
const arithmeticParser = new Grammar(
    ["$Root"],
    basicTokenizer,
    [digitParser, numberParser],
    [
        // define a valid parse
        new Rule(
            'root',
            '$Root', '?$Ignorable $Expr ?$Ignorable',
            (x, y, z) => y
        ),
        // make ignorables
        new Rule(
            'ignorable',
            '$Ignorable', 'say',
            () => null
        ),
        new Rule(
            'ignorable',
            '$Ignorable', 'tell me',
            () => null
        ),
        new Rule(
            'ignorable',
            '$Ignorable', 'what',
            () => null
        ),
        new Rule(
            'ignorable',
            '$Ignorable', 'whats',
            () => null
        ),
        new Rule(
            'ignorable',
            '$Ignorable', 'is',
            () => null
        ),
        new Rule(
            'ignorable',
            '$Ignorable', 'how much',
            () => null
        ),
        new Rule(
            'ignorable',
            '$Ignorable', '$Ignorable $Ignorable',
            () => null
        ),
        new Rule(
            'exprToNumber',
            '$Expr', '$Number',
            x => x
        ),
        // encode basic arithmetic operations
        new Rule(
            'unaryMinus',
            '$UnaryOp', 'minus',
            () => x => -x
        ),
        new Rule(
            'unaryPlus',
            '$UnaryOp', 'plus',
            () => x => x
        ),
        new Rule(
            'binaryPlus',
            '$BinaryOp', 'plus',
            () => (x, y) => x + y
        ),
        new Rule(
            'binaryMinus',
            '$BinaryOp', 'minus',
            () => (x, y) => x - y
        ),
        new Rule(
            'binaryTimes',
            '$BinaryOp', 'times',
            () => (x, y) => x * y
        ),
        // composition rules
        new Rule(
            'unaryApplication',
            '$Expr', '$UnaryOp $Expr',
            (x, y) => x(y)
        ),
        new Rule(
            'binaryApplication',
            '$Expr', '$Expr $BinaryOp $Expr',
            (x, y, z) => y(x, z)
        ),
        // mixed lexical / categorical rule
        new Rule(
            'introExpression',
            '$Expr', 'how about $Expr',
            (x, y, z) => z
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
