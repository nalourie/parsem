/* base classes for parsing */

import {
    AbstractClassError,
    NotImplementedError,
} from '../utils/abstract';
import { isType } from '../utils/compare';
import { assert } from '../utils/assert';


/**
 * Parse
 * =====
 * The base class for parses.
 *
 * A parse represents a structured interpretation of a string. To
 * implement a parse, extend `Parse`. No attributes or overrides are
 * necessary.
 *
 * Methods
 * -------
 * computeDenotation : -> Any
 *   Compute the denotation of the parse.
 *
 * Attributes
 * ----------
 * tag : String
 *   An identifier for the parse, i.e. something like `plus`.
 * category : String
 *   The category that the parse matches, i.e. `$binaryOp`.
 * span : String
 *   The actual span of tokens that the parse matched.
 * children : [Parse]
 *   The children of the parse, a list of parses.
 * semantics : Function
 *   The semantics of the parse, i.e. a function from the denotations of
 *   the parse's children to the denotation of the parse.
 */
class Parse {
    constructor(tag, category, span, children, semantics) {
        if (isType(this, Parse)) {
            throw new AbstractClassError(
                "Parser is an abstract class. It should not be instantiated."
            );
        }

        // methods

        this.computeDenotation = () => {
            return this.semantics(
                ...this.children.map(x => x.computeDenotation())
            );
        }

        // attributes

        assert(
            isType(tag, String),
            "Parse: tag must be of type String."
        );
        this.tag = tag;

        assert(
            isType(category, String),
            "Parse: category must be of type String."
        );
        this.category = category;

        assert(
            isType(span, String),
            "Parse: span must be of type String."
        );
        this.span = span;

        assert(
            isType(children, Array),
            "Parse: children must be an array of Parses."
        );
        this.children = children;

        assert(
            isType(semantics, Function),
            "Parse: semantics must be of type Function."
        );
        this.semantics = semantics;
    }
}


/**
 * Parser
 * ======
 * The base class for parsers.
 *
 * To implement a parser, extend `Parser` and implement a `parse` method
 * that takes a string and returns a `Parse` subclass. `Parser`
 * constructors must take a `roots` attribute which defines the default
 * root categories for the parse, against which the `parse` method will
 * filter before returning parses.
 *
 * Methods
 * -------
 * parse : String -> Parse
 *   Convert a String into a Parse instance.
 *
 *   @param {String} s - the string to parse.
 *   @param {[String]} roots - an array of strings representing the root
 *     symbols to be returned. The returned parses are filtered down
 *     just to categories which match one of these root
 *     symbols. Defaults to the `roots` attribute of the parser. If
 *     roots is empty then all parses are returned.
 */
class Parser {
    constructor(roots) {
        if (isType(this, Parser)) {
            throw new AbstractClassError(
                "Parser is an abstract class."
            );
        }

        // methods

        this.parse = (s, roots = roots) => {
            throw new NotImplementedError(
                "Parser subclasses must implement a parse method."
            );
        }

        // attributes
        assert(
            isType(roots, Array),
            "Parser: roots attribute must be of type Array."
        );
        this.roots = roots;
    }
}


export {
    Parse,
    Parser
};
