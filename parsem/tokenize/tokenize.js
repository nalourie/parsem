/* Tokenizers */

import {
    AbstractClassError,
    NotImplementedError
} from '../utils/abstract';
import {
    isType,
    equal
} from '../utils/compare';
import { check } from '../utils/test';


/**
 * Token
 * =====
 * The data type for tokens.
 *
 * To create a token simply call the `Token` constructor. See the
 * Attributes section for details on the arguments to the constructor.
 * Note that `new Token("foo", [0,3])` will return the object literal,
 * `{token: "foo", span: [0,3]}` rather than an instance of `Token`,
 * i.e. `this` in the constructor.
 *
 * Attributes
 * ----------
 * token : String
 *   The string representing the token. This string should have all of
 *   the normalization done by the tokenizer applied to it.
 * span : [Number, Number]
 *   A pair of numbers representing the start index and end index
 *   (exclusive of the end) of the token in the original string. Feeding
 *   span as the arguments to `String.slice` should return the span of
 *   the original string that best corresponds to the token.
 */
class Token {
    constructor(token, span) {
        return {token, span}
    }
}


/**
 * Tokenizer
 * =========
 * The base class for tokenizers.
 *
 * To implement a tokenizer, extend `Tokenizer` and implement
 * `tokenize` method which takes a string and returns a list of tokens.
 *
 * Methods
 * -------
 * tokenize : String -> [Token]
 *   Convert a string into a list of tokens.
 *
 *   @param {String} s - the string to tokenize.
 */
class Tokenizer {
    constructor() {
        if (isType(this, Tokenizer)) {
            throw new AbstractClassError(
                "Tokenizer is an abstract class."
            );
        }

        // methods

        this.tokenize = (s) => {
            throw new NotImplementedError(
                "Tokenizer subclasses must implement the tokenize method."
            );
        }

        // attributes
    }
}


/**
 * BasicTokenizer
 * ==============
 * A basic tokenizer.
 *
 * BasicTokenizer tokenizes by dropping some characters, splitting on
 * others and applying a sequence of transformations to strings before
 * they are emitted as tokens. The characters dropped or split on as
 * well as the transformations applied depend on arguments to the
 * constructor. See Attributes for details.
 *
 * Methods
 * -------
 * tokenize : String -> [Token]
 *   Convert a string into a list of tokens.
 *
 *   @param {String} s - the string to tokenize.
 *
 * Attributes
 * ----------
 * dropChars : RegExp
 *   A regular expression matching the characters to drop.
 * splitChars : RegExp
 *   A regular expression matching the characters to split on.
 * transformations : [String => String]
 *   An array of functions transforming strings to apply to the
 *   token string before creating the token. Transformations in the
 *   array are applied left-to-right.
 */
class BasicTokenizer extends Tokenizer {
    constructor(dropChars, splitChars, transformations) {
        super()

        // helper functions

        /**
         * addToken : (String, [Number, Number], [Token], [Function]) -> null
         *   Create and add a token to the tokens array.
         *
         *   @param {String} token - the string content of the token.
         *   @param {[Number, Number]} span - the pair of numbers
         *     (startIndex, endIndex) defining the span that the
         *     token corresponds to in the original string. endIndex
         *     should be one greater than the index of the last
         *     character of the span. See `Token` class for details.
         *   @param {[Token]} tokens - the array of tokens into which
         *     the new token will be pushed.
         *   @param {[Function]} transformations - the transformations
         *     to apply to token before creating the new Token.
         */
        const addToken = (
            token,
            span,
            tokens,
            transformations
        ) => {
            // apply the transformations from left to right to
            // the token.
            token = transformations.reduce(
                (x, transform) => transform(x),
                token
            );

            // filter out empty tokens
            if (token.length > 0) {
                tokens.push(new Token(token, span));
            }
        }

        // methods

        this.tokenize = (s) => {
            const tokens = [];
            let token = "";
            let span = [0, null];

            for (let i = 0; i < s.length; i++) {
                const c = s.charAt(i);

                if (!dropChars.test(c) && !splitChars.test(c)) {
                    // accumulate the char on the token
                    token += c;
                } else if (dropChars.test(c)) {
                    // nothing to do here
                    continue
                } else if (splitChars.test(c)) {
                    // push the new token

                    // update the span
                    span[1] = i;

                    addToken(token, span, tokens, transformations);

                    // reset the token accumulators
                    token = "";
                    span = [i + 1, null];
                }
            }

            // update the span
            span[1] = s.length;

            addToken(token, span, tokens, transformations);

            return tokens
        }

        // attributes
    }
}
const basicTokenizer = new BasicTokenizer(
    /[~`!@#$%^&*()_=+{}|\]\^\\/?<>.,:;'"]/,
    /\s+/,
    [c => c.toLowerCase()]
);
check(
    "basicTokenizer.tokenize should return an empty array on the empty string.",
    equal(
        basicTokenizer.tokenize(""),
        []
    )
);
check(
    "basicTokenizer.tokenize should tokenize one token correctly.",
    equal(
        basicTokenizer.tokenize("one"),
        [new Token("one", [0,3])]
    )
);
check(
    "basicTokenizer.tokenize should tokenize multiple tokens correctly.",
    equal(
        basicTokenizer.tokenize("one two three"),
        [
            new Token("one", [0,3]),
            new Token("two", [4,7]),
            new Token("three", [8,13])
        ]
    )
);
check(
    "basicTokenizer.tokenize should remove punctuation.",
    equal(
        basicTokenizer.tokenize("hello!"),
        [new Token("hello", [0,6])]
    )
);
check(
    "basicTokenizer.tokenize should transform to lowercase.",
    equal(
        basicTokenizer.tokenize("All CAPS"),
        [
            new Token("all", [0,3]),
            new Token("caps", [4,8])
        ]
    )
);
check(
    "basicTokenizer.tokenize should strip whitespace.",
    equal(
        basicTokenizer.tokenize("A \n  string  "),
        [
            new Token("a", [0, 1]),
            new Token("string", [5,11])
        ]
    )
);


export {
    Tokenizer,
    BasicTokenizer,
    basicTokenizer
};
