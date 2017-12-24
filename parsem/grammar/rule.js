/* Definition of a production rule for a grammar. */

import { assert } from '../utils/assert';
import { isType } from '../utils/compare';
import {
    check,
    suite,
    test
} from '../utils/test';
import {
    isTerminal,
    isNonTerminal,
    isOptional
} from './symbol';


/**
 * Rule
 * ====
 * Production rules for describing a grammar.
 *
 * Create a new `Rule` using the `new` keyword and passing a `tag`,
 * `lhs`, `rhs`, and `semantics` argument as described in the
 * attributes section. Rules use a syntax for specifying the `lhs` and
 * `rhs` similar to the syntax used by SippyCup.
 *
 * Methods
 * -------
 * toString : -> String
 *   Convert the rule to a string representation.
 * arity : -> Integer
 *   Return the arity of the rule's right hand side.
 * isUnary : -> Boolean
 *   Return true if the rule is unary, otherwise false.
 * isBinary : -> Boolean
 *   Return true if the rule is binary, otherwise false.
 * isNary : -> Boolean
 *   Return true if the rule's arity is greater than 2.
 * isLexical : -> Boolean
 *   Return true if the rule is lexical, i.e. the rhs only matches
 *   terminal elements.
 * isCategorical : -> Boolean
 *   Return true if the rule is categorical, i.e. the rhs only matches
 *   non-terminal elements.
 * isMixed : -> Boolean
 *   Return true if the rule is mixed categorical and lexical, i.e. the
 *   rhs matches a mix of categorical and lexical elements.
 * hasOptionals : -> Boolean
 *   Return true if the rule's rhs has optional elements.
 *
 * Attributes
 * ----------
 * tag : String
 *   An identifier for the rule which will be used as the `tag`
 *   attribute for parses constructed from the rule. Because multiple
 *   rules may have the same `lhs` and `rhs` (though hopefully
 *   different `semantics`), the `tag` is necessary for debugging and
 *   feature generation for parse ranking.
 * lhs : String
 *   The left hand side of symbols which the rule
 *   produces. `lhs` should be a single category, or non-terminal,
 *   such as `$Root`.
 * rhs : String (or [String])
 *   The right hand side against which the rule matches.
 * semantics : Function
 *   The semantics of the rule which will be passed as the semantics of
 *   whatever parses it produces. In other words, a function from the
 *   denotations of the children of the parse to the parse's
 *   denotation.
 */
class Rule {
    constructor(tag, lhs, rhs, semantics) {

        // methods

        this.toString = () => {
            return this.lhs + " -> " + this.rhs.join(' ');
        }

        this.inspect = () => {
            return "Rule : " + this.toString();
        }

        this.arity = () => {
            return this.rhs.length;
        }

        this.isUnary = () => {
            return this.rhs.length === 1;
        }

        this.isBinary = () => {
            return this.rhs.length === 2;
        }

        this.isNary = () => {
            return this.rhs.length > 2;
        }

        this.isLexical = () => {
            return this.rhs.every(isTerminal);
        }

        this.isCategorical = () => {
            return this.rhs.every(isNonTerminal);
        }

        this.isMixed = () => {
            return !(this.isLexical() || this.isCategorical());
        }

        this.hasOptionals = () => {
            return this.rhs.some(isOptional);
        }

        // attributes

        assert(
            isType(tag, String),
            "Rule: tag must be a String."
        );
        this.tag = tag;

        assert(
            isType(lhs, String),
            "Rule: lhs must be a String."
        );
        assert(
            isNonTerminal(lhs),
            "Rule: lhs must be a non-terminal."
        );
        this.lhs = lhs;

        assert(
            isType(rhs, String) || isType(rhs, Array),
            "Rule: rhs must be a String or an Array."
        );
        this.rhs = isType(rhs, String) ? rhs.split(' ') : rhs
        assert(
            this.rhs.length > 0,
            "Rule: arity 0 rules are not allowed."
        );

        assert(
            isType(semantics, Function),
            "Rule: semantics must be a function of the child denotations."
        );
        this.semantics = semantics;
    }
}
suite('rule', [
    test('Rule.toString', function () {
        check(
            "Rule should correctly coerce to a string.",
            new Rule('x', '$a', 'b', () => null).toString() === '$a -> b'
        );
    }),
    test('Rule.arity', function () {
        check(
            "Rule should return correct arity when unary.",
            new Rule('x', '$a', 'b', () => null).arity() === 1
        );
        check(
            "Rule should return correct arity when binary.",
            new Rule('x', '$a', 'b c', () => null).arity() === 2
        );
        check(
            "Rule should return correct arity when trinary.",
            new Rule('x', '$a', '$b c $d', () => null).arity() === 3
        );
    }),
    test('Rule.isUnary', function () {
        check(
            "Rule.isUnary should return true when rule is unary.",
            new Rule('x', '$a', '$b', () => null).isUnary()
        );
        check(
            "Rule.isUnary should return false when rule is not unary.",
            !(new Rule('x', '$a', '$b $c', () => null)).isUnary()
        );
    }),
    test('Rule.isBinary', function () {
        check(
            "Rule.isBinary should return true when rule is binary.",
            new Rule('x', '$a', '$b a', () => null).isBinary()
        );
        check(
            "Rule.isBinary should return false when rule is not binary.",
            !(new Rule('x', '$a', '$b $c $d', () => null)).isBinary()
        );
    }),
    test('Rule.isNary', function () {
        check(
            "Rule.isNary should return true when rule is nary.",
            new Rule('x', '$a', '$b c d', () => null).isNary()
        );
        check(
            "Rule.isNary should return false when rule is not nary.",
            !(new Rule('x', '$a', '$b $c', () => null)).isNary()
        );
    }),
    test('Rule.isLexical', function () {
        check(
            "Rule.isLexical should return true if it's lexical.",
            new Rule('x', '$a', 'foo bar', () => null).isLexical()
        );
        check(
            "Rule.isLexical should return false if it's categorical.",
            !(new Rule('x', '$a', '$b $a', () => null).isLexical())
        );
        check(
            "Rule.isLexical should return false if it's mixed.",
            !(new Rule('x', '$a', 'b $a', () => null).isLexical())
        );
    }),
    test('Rule.isCategorical', function () {
        check(
            "Rule.isCategorical should return true if it's categorical.",
            new Rule('x', '$a', '$b $a', () => null).isCategorical()
        );
        check(
            "Rule.isCategorical should return false if it's lexical.",
            !(new Rule('x', '$a', 'b a', () => null).isCategorical())
        );
        check(
            "Rule.isCategorical should return false if it's mixed.",
            !(new Rule('x', '$a', 'b $a', () => null).isCategorical())
        );
    }),
    test('Rule.isMixed', function () {
        check(
            "Rule.isMixed should return true if it's mixed.",
            new Rule('x', '$a', 'b $a', () => null).isMixed()
        );
        check(
            "Rule.isMixed should return false if it's lexical.",
            !(new Rule('x', '$a', 'b a', () => null).isMixed())
        );
        check(
            "Rule.isMixed should return false if it's categorical.",
            !(new Rule('x', '$a', '$b $a', () => null).isMixed())
        );
    }),
    test("Rule.hasOptionals", function () {
        check(
            "Rule.hasOptionals should return true if there's a lexical optional.",
            new Rule('x', '$a', '?a', () => null).hasOptionals()
        );
        check(
            "Rule.hasOptionals should return true if there's a categorical optional.",
            new Rule('x', '$a', '?$a', () => null).hasOptionals()
        );
        check(
            "Rule.hasOptionals should return false if there's no optional.",
            !(new Rule('x', '$a', '$a', () => null).hasOptionals())
        );
    })
]);


export { Rule };
