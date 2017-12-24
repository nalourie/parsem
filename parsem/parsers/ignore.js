/* a parser for ignoring spans. */

import {
    isType
} from '../utils/compare';
import {
    check,
    suite,
    test
} from '../utils/test';
import { Parse, Parser } from '../parse/parse';


/**
 * IgnorableParse
 * ==============
 * A parse representing a span which is ignored.
 *
 * `IgnorableParse` stores it's span and has a semantic function which
 * simply returns null.
 *
 * See `Parse` for methods and attributes.
 */
class IgnorableParse extends Parse {
    constructor(span) {
        super("ignorable", "$Ignorable", span, [], () => null);

        // methods

        // attributes
    }
}


/**
 * IgnorableParser
 * ===============
 * A parser for parsing language that will be ignored.
 *
 * `IgnorableParser` will take any span and return a parse which simply
 * ignores it.
 *
 * Methods
 * -------
 * parse : String Optional[[String]] -> [IgnorableParse]
 *   Convert a string into a parse that ignores the string.
 */
class IgnorableParser extends Parser {
    constructor(roots) {
        super(roots);

        // methods

        this.parse = (s, roots = this.roots) => {
            return [
                new IgnorableParse(s)
            ];
        }

        // attributes
    }
}
const ignorableParser = new IgnorableParser(["$Ignorable"]);
suite('ignore', [
    test('ignorableParser.parse', function () {
        check(
            "ignorableParser should return an IgnorableParse.",
            isType(
                ignorableParser.parse("a test string.")[0],
                IgnorableParse
            )
        );
        check(
            "ignorableParser should return only one parse.",
            ignorableParser
                .parse("This is some text!")
                .length === 1
        );
        check(
            "ignorableParser should return parses with null semantics.",
            ignorableParser
                .parse("The dog runs fast.")[0]
                .computeDenotation() === null
        );
    })
]);


export {
    IgnorableParse,
    IgnorableParser,
    ignorableParser
};
