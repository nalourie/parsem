/* parser for arithmetic expressions. */

import {
    check,
    suite,
    test
} from '../utils/test';
import { basicTokenizer } from '../tokenize/tokenize';
import { Rule } from '../grammar/rule';
import { Grammar } from '../grammar/grammar';

import { digitParser, numberParser } from './numbers';


/* a parser for solving natural language arithmetic problems. */
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
        check(
            "arithmeticParser.parse should parse one.",
            arithmeticParser.parse("one")[0].computeDenotation() === 1
        );
        check(
            "arithmeticParser.parse should parse two.",
            arithmeticParser.parse("two")[0].computeDenotation() === 2
        );
        check(
            "arithmeticParser.parse should parse minus one.",
            arithmeticParser.parse("minus one")[0].computeDenotation() === -1
        );
        check(
            "arithmeticParser.parse should parse minus three.",
            arithmeticParser.parse("minus three")[0].computeDenotation() === -3
        );
        check(
            "arithmeticParser.parse should parse minus minus three.",
            arithmeticParser.parse('minus minus three')[0].computeDenotation() === 3
        );
        check(
            "arithmeticParser.parse should parse one plus one.",
            arithmeticParser.parse('one plus one')[0].computeDenotation() === 2
        );
        check(
            "arithmeticParser.parse should parse one plus one plus one.",
            arithmeticParser.parse('one plus one plus one')[0].computeDenotation() === 3
        );
        check(
            "arithmeticParser.parse should parse one plus two minus three.",
            arithmeticParser.parse('one plus two minus three')[0].computeDenotation() === 0
        );
        check(
            "arithmeticParser.parse should parse one plus two minus minus three.",
            arithmeticParser.parse('one plus two minus minus three')[0].computeDenotation() === 6
        );
        check(
            "arithmeticParser.parse should parse five minus minus one.",
            arithmeticParser.parse('five minus minus one')[0].computeDenotation() === 6
        );
        check(
            "arithmeticParser.parse should parse five minus plus one.",
            arithmeticParser.parse('five minus plus one')[0].computeDenotation() === 4
        );
        check(
            "arithmeticParser.parse should parse what is five minus one.",
            arithmeticParser.parse('what is five minus one')[0].computeDenotation() === 4
        );
        check(
            "arithmeticParser.parse should parse What is one plus five?.",
            arithmeticParser.parse('What is one plus five?')[0].computeDenotation() === 6
        );
        check(
            "arithmeticParser.parse should parse Three minus seven times two is how much?.",
            arithmeticParser.parse('Three minus seven times two is how much?')[0].computeDenotation() === -8
        );
        check(
            "arithmeticParser.parse should parse Say, how much is six times five?.",
            arithmeticParser.parse('Say, how much is six times five?')[0].computeDenotation() === 30
        );
        check(
            "arithmeticParser.parse should parse what is 43 plus 21?.",
            arithmeticParser.parse('what is 43 plus 21?')[0].computeDenotation() === 64
        );
        check(
            "arithmeticParser.parse should parse How about 4 plus seven?.",
            arithmeticParser.parse('How about 4 plus seven?')[0].computeDenotation() === 11
        );
        check(
            "arithmeticParser.parse should parse What is 2 to the 3?.",
            arithmeticParser.parse('What is 2 to the 3?')[0].computeDenotation() === 8
        );
    })
]);


export { arithmeticParser };
