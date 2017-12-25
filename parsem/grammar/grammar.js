/* Context free grammars. */

import { assert } from '../utils/assert';
import { isType } from '../utils/compare';
import {
    check,
    suite,
    test
} from '../utils/test';
import {
    Tokenizer,
    basicTokenizer
} from '../tokenize/tokenize';
import { Parser } from '../parse/parse';
import {
    isTerminal,
    isNonTerminal,
    isOptional,
    stripOptional
} from './symbol';
import { Rule } from './rule';
import { Derivation } from './derivation';


/**
 * Grammar
 * =======
 * A context-free grammar based parser.
 *
 * `Grammar` can take a tokenizer, subparsers, array of rules, and an
 * array of root symbols and create a new parser that tokenizes input
 * with the tokenizer, incorporates the parses from the subparses and
 * then combines the parsers by applying the production rules in
 * `rules`, returning only parses whose category is in the array of root
 * symbols by default.
 *
 * Methods
 * -------
 * parse : String Optional[[String]] -> [Derivation]
 *   Return an Array of Derivations representing parses of the string s.
 *
 *   @param {String} s - the string to parse.
 *   @param {[String]} roots - an array of strings representing the root
 *     symbols to be returned. The returned parses are filtered down
 *     just to categories which match one of these root
 *     symbols. Defaults to the `roots` attribute of the grammar. If
 *     roots is empty then all parses are returned.
 *
 * Attributes
 * ----------
 * tokenizer : Tokenizer
 *   The tokenizer used to tokenize the input string. The tokenizer
 *   will automatically be applied to the `rhs`s of each rule in
 *   `rules`, so that the grammar will match rules based on the
 *   tokenized symbols rather than the raw symbols.
 * subparses : [Parser]
 *   Subparsers to produce parses that will be incorporated into the
 *   grammar. For example, a specialized parser could be passed that
 *   parses numbers.
 * rules : [Rule]
 *   The production rules defining the context-free grammar.
 * roots : [String]
 *   An array of root categories representing the default categories to
 *   filter against when returning parses.
 */
class Grammar extends Parser {
    constructor(roots, tokenizer, subparsers, rules) {
        super(roots)

        // helper functions for the constructor

        // internally, on generated rules ~ means that an element of the
        // original rule was omitted, $@ begins a generated lexical
        // category, _ connects categories in binarized n-ary rules, and
        // - connects lexical elements in multi-token lexical rules.

        /**
         * processOptionalRule : (Rule, [Rule]) -> null
         *   Process an optional rule.
         *
         *   Optional rules must be converted into multiple rules with
         *   and without the optional elements.
         *
         *   @param {Rule} rule - the rule to process.
         *   @param {[Rule]} rules - an array of rules to update with
         *     new rules created as a result of processing `rule`.
         */
        const processOptionalRule = (rule, rules) => {
            const optionalIndex = rule.rhs.findIndex(isOptional);
            const optionalWord = stripOptional(
                rule.rhs[optionalIndex]
            );

            const rhsWithOption = rule.rhs.slice();
            rhsWithOption[optionalIndex] = optionalWord;
            rules.push(
                new Rule(
                    rule.tag + "_" + optionalWord,
                    rule.lhs,
                    rhsWithOption,
                    rule.semantics
                )
            );

            const rhsWithoutOption = rule.rhs.slice()
            rhsWithoutOption.splice(optionalIndex, 1);
            rules.push(
                new Rule(
                    rule.tag + "_~" + optionalWord,
                    rule.lhs,
                    rhsWithoutOption,
                    (...args) => {
                        // insert null in for the optional's
                        // semantics
                        args.splice(optionalIndex, 0, null);
                        return rule.semantics(...args);
                    }
                )
            );
        }

        /**
         * processMixedRule : (Rule, [Rules]) -> null
         *   Process a rule with both lexical and categorical elements.
         *
         *   Rules with lexical and categorical elements must be
         *   converted into a rule with only categorical elements and
         *   several rules for categories that match just that one
         *   lexical element.
         *
         *   @param {Rule} rule - the rule with mixed elements to be
         *     processed.
         *   @param {Array} rules - the array of rules to be updated
         *     with rules produced by processing `rule`.
         */
        const processMixedRule = (
            rule,
            rules,
            generatedLexicalRules
        ) => {
            // convert the lexical elements into categories
            // containing just those lexical elements, for
            // example, "from" -> "$@from". We start with the
            // underscore to avoid name collisions with user
            // created rules.
            const newRhs = rule.rhs.map(
                x => isTerminal(x) ? "$@" + x : x
            );
            rules.push(
                new Rule(
                    rule.tag,
                    rule.lhs,
                    newRhs,
                    rule.semantics
                )
            );

            // create a lexical rule for each lexical element
            // and then add the new rules
            const lexicalElements = rule.rhs.filter(isTerminal);
            for (let i = 0; i < lexicalElements.length; i++) {
                const lexicalElement = lexicalElements[i];
                const key = this.tokenizer
                      .tokenize(lexicalElement)
                      .map(t => t.token)
                      .join('-');
                // remove duplicates
                if (!generatedLexicalRules.has(key)) {
                    rules.push(
                        new Rule(
                            lexicalElement,
                            "$@" + key,
                            lexicalElement,
                            () => lexicalElement
                        )
                    );
                    generatedLexicalRules.add(key);
                }
            }
        }

        /**
         * processNaryRule : (Rule, [Rule]) -> null
         *   Process an Nary non-lexical rule.
         *
         *   Nary composition rules, i.e. Nary rules with categorical
         *   elements, must be converted into multiple binary rules.
         *
         *   @param {Rule} rule - the Nary non-lexical rule to be
         *     processed.
         *   @param {Array} rules - the array of rules to update with
         *     the rules produced by processing `rule`.
         */
        const processNaryRule = (
            rule,
            rules,
            generatedNaryRules
        ) => {
            const firstNonTerminal = rule.rhs[0];
            const secondNonTerminal = rule.rhs[1];
            const restNonTerminals = rule.rhs.slice(2);

            const newRuleLhs = `${firstNonTerminal}_${secondNonTerminal}`;
            const newRuleRhs = [firstNonTerminal, secondNonTerminal];

            const oldRule = new Rule(
                rule.tag,
                rule.lhs,
                [newRuleLhs, ...restNonTerminals],
                (x, ...y) => rule.semantics(x[0], x[1], ...y)
            );
            rules.push(oldRule);

            if (!generatedNaryRules.has(newRuleLhs)) {
                const newRule = new Rule(
                    rule.tag + "_" + newRuleLhs,
                    newRuleLhs,
                    newRuleRhs,
                    (...args) => args
                );
                rules.push(newRule);
                generatedNaryRules.add(newRuleLhs);
            }
        }
        const processRules = (rules) => {
            // copy rules because we'll be mutating it
            rules = rules.slice();

            const lexicalRules = {};
            const binaryRules = {};
            const unaryRules = {};

            // we'll want to avoid creating duplicate lexical rules.
            const generatedLexicalRules = new Set();
            const generatedNaryRules = new Set();

            while (rules.length > 0) {
                const rule = rules.shift()

                if (rule.hasOptionals()) {
                    processOptionalRule(rule, rules);
                } else if (rule.isMixed()) {
                    processMixedRule(
                        rule,
                        rules,
                        generatedLexicalRules
                    );
                } else if (rule.isNary() && !rule.isLexical()) {
                    processNaryRule(
                        rule,
                        rules,
                        generatedNaryRules
                    );
                } else if (rule.isLexical()) {
                    // add the lexical rule to `lexicalRules`
                    const key = rule.rhs.map(
                        s => this.tokenizer.tokenize(s).map(t => t.token).join(',')
                    );
                    if (!lexicalRules.hasOwnProperty(key)) {
                        lexicalRules[key] = [];
                    }
                    lexicalRules[key].push(rule);
                } else if (rule.isUnary()) {
                    // add the unary rule to `unaryRules`
                    const key = rule.rhs;
                    if (!unaryRules.hasOwnProperty(key)) {
                        unaryRules[key] = [];
                    }
                    unaryRules[key].push(rule);
                } else if (rule.isBinary()) {
                    // add the binary rule to `binaryRules`
                    const key = rule.rhs;
                    if (!binaryRules.hasOwnProperty(key)) {
                        binaryRules[key] = [];
                    }
                    binaryRules[key].push(rule);
                } else {
                    throw new TypeError(
                        `Issue processing Rule instance ${rule}.`
                    );
                }
            }

            return {
                lexicalRules: lexicalRules,
                unaryRules: unaryRules,
                binaryRules: binaryRules
            };
        }

        // methods

        this.parse = (s, roots = this.roots) => {
            // tokenize the input
            const tokens = this.tokenizer.tokenize(s);
            const chart = {}

            if (tokens.length === 0) {
                return [];
            }

            // iterate through all spans, producing parses of them in a
            // bottom up fashion.
            for (let l = 1; l <= tokens.length; l++) {
                for (let i = 0; i <= tokens.length - l; i++) {
                    const j = i + l;

                    const currentTokens = tokens.slice(i,j);
                    const stringSpan = s.slice(
                        currentTokens[0].span[0],
                        currentTokens[currentTokens.length - 1].span[1]
                    );
                    const tokenSpan = currentTokens.map(t => t.token);
                    chart[[i,j]] = []

                    // apply subparsers

                    for (let k = 0; k < this.subparsers.length; k++) {
                        chart[[i,j]].push(
                            ...this.subparsers[k].parse(stringSpan)
                        );
                    }

                    // apply lexical rules matching the tokenSpan

                    const lexicalRules = this.lexicalRules[tokenSpan] || [];
                    for (let k = 0; k < lexicalRules.length; k++) {
                        const rule = lexicalRules[k]
                        chart[[i,j]].push(
                            new Derivation(rule, stringSpan, [])
                        );
                    }

                    // apply binary rules

                    for (let s = 1; s < tokenSpan.length; s++) {
                        const lParses = chart[[i,i+s]] || [];
                        const rParses = chart[[i+s,j]] || [];

                        // iterate over all combinations of parses
                        for (let m = 0; m < lParses.length; m++) {
                            for (let n = 0; n < rParses.length; n++) {
                                const lParse = lParses[m];
                                const rParse = rParses[n];

                                const binaryRules = this.binaryRules[
                                    [lParse.category, rParse.category]] || []
                                for (let k = 0; k < binaryRules.length; k++) {
                                    const rule = binaryRules[k];
                                    chart[[i,j]].push(
                                        new Derivation(
                                            rule,
                                            stringSpan,
                                            [lParse, rParse]
                                        )
                                    );
                                }
                            }
                        }
                    }

                    // apply unary rules

                    // unary rules must be applied last because a binary
                    // rule could generate a category matched by a unary
                    // rule.
                    const spanParses = chart[[i,j]];
                    for (let k = 0; k < spanParses.length; k++) {
                        const parse = spanParses[k];
                        const unaryRules = this.unaryRules[parse.category] || [];
                        for (let h = 0; h < unaryRules.length; h++) {
                            const rule = unaryRules[h];
                            chart[[i,j]].push(
                                new Derivation(
                                    rule,
                                    stringSpan,
                                    [parse]
                                )
                            );
                        }
                    }
                }
            }

            let parses;
            if (roots.length > 0) {
                parses = chart[[0,tokens.length]].filter(
                    p => roots.includes(p.category)
                );
            } else {
                parses = chart[[0,tokens.length]];
            }

            return parses;
        }

        // attributes

        assert(
            tokenizer instanceof Tokenizer,
            "Grammar: tokenizer must be an instance of a tokenizer"
        );
        this.tokenizer = tokenizer;

        assert(
            isType(subparsers, Array),
            "Grammar: subparsers must be an Array."
        );
        assert(
            subparsers.every(p => p instanceof Parser),
            "Grammar: all subparsers must be instances of a Parser subclass."
        );
        this.subparsers = subparsers;

        assert(
            isType(rules, Array),
            "Grammar: rules must be an Array"
        );
        this.rules = rules;

        // process rules into a format useful for parsing
        const processedRules = processRules(rules);

        this.lexicalRules = processedRules.lexicalRules;
        this.binaryRules = processedRules.binaryRules;
        this.unaryRules = processedRules.unaryRules;
    }
}
suite('grammar', [
    test('Grammar.constructor on lexical rules', function () {
        const testGrammar = new Grammar(
            ['$Root'],
            basicTokenizer,
            [],
            [
                new Rule(
                    'tag',
                    '$lhs', 'foo',
                    () => null
                )
            ]
        );
        check(
            "Grammar.constructor should create one lexical rule.",
            testGrammar.lexicalRules['foo'].length === 1
        );
        check(
            "Grammar.constructor should create a lexical rule.",
            isType(testGrammar.lexicalRules['foo'][0], Rule)
        );
        check(
            "Grammar.constructor should not create binary rules.",
            Object.keys(testGrammar.binaryRules).length === 0
        );
        check(
            "Grammar.constructor should not create unary rules.",
            Object.keys(testGrammar.unaryRules).length === 0
        );
    }),
    test('Grammar.constructor on binary rules', function () {
        const testGrammar = new Grammar(
            ['$Root'],
            basicTokenizer,
            [],
            [
                new Rule(
                    'tag',
                    '$lhs', '$foo $bar',
                    () => null
                )
            ]
        );
        check(
            "Grammar.constructor should create no lexical rules.",
            Object.keys(testGrammar.lexicalRules).length === 0
        );
        check(
            "Grammar.constructor should create a binary rule.",
            testGrammar.binaryRules['$foo,$bar'].length === 1
        );
        check(
            "Grammar.constructor should create a lexical rule.",
            isType(testGrammar.binaryRules['$foo,$bar'][0], Rule)
        );
        check(
            "Grammar.constructor should not create unary rules.",
            Object.keys(testGrammar.unaryRules).length === 0
        );
    }),
    test('Grammar.constructor on unary rules.', function () {
        const testGrammar = new Grammar(
            ['$Root'],
            basicTokenizer,
            [],
            [
                new Rule(
                    'tag',
                    '$lhs', '$foo',
                    () => null
                )
            ]
        );
        check(
            "Grammar.constructor should create no lexical rules.",
            Object.keys(testGrammar.lexicalRules).length === 0
        );
        check(
            "Grammar.constructor should create no binary rules.",
            Object.keys(testGrammar.binaryRules).length === 0
        );
        check(
            "Grammar.constructor should create one unary rule.",
            testGrammar.unaryRules['$foo'].length === 1
        );
        check(
            "Grammar.constructor should create a unary rule.",
            isType(testGrammar.unaryRules['$foo'][0], Rule)
        );
    }),
    test('Grammar.constructor on optionals', function () {
        const testGrammar = new Grammar(
            ['$Root'],
            basicTokenizer,
            [],
            [
                new Rule(
                    'tag',
                    '$lhs', '$foo ?$bar',
                    () => null
                )
            ]
        );
        check(
            "Grammar.constructor should create one unary rule.",
            Object.keys(testGrammar.unaryRules).length === 1
        );
        check(
            "Grammar.constructor should create one unary rule.",
            testGrammar.unaryRules["$foo"].length === 1
        );
        check(
            "Grammar.constructor should create a unary rule.",
            isType(testGrammar.unaryRules["$foo"][0], Rule)
        );
        check(
            "Grammar.constructor should create one binary rule.",
            Object.keys(testGrammar.binaryRules).length === 1
        );
        check(
            "Grammar.constructor should create one binary rule.",
            testGrammar.binaryRules["$foo,$bar"].length === 1
        );
        check(
            "Grammar.constructor should create a unary rule.",
            isType(testGrammar.binaryRules["$foo,$bar"][0], Rule)
        );
        check(
            "Grammar.constructor should create no lexical rules.",
            Object.keys(testGrammar.lexicalRules).length === 0
        );
    }),
    test('Grammar.constructor on mixed rules.', function () {
        const testGrammar = new Grammar(
            ['$Root'],
            basicTokenizer,
            [],
            [
                new Rule(
                    'tag',
                    '$lhs', '$foo bar',
                    () => null
                )
            ]
        );
        check(
            "Grammar.constructor should create one lexical rule.",
            Object.keys(testGrammar.lexicalRules).length === 1
        );
        check(
            "Grammar.constructor should create one rule for 'bar'.",
            testGrammar.lexicalRules["bar"].length === 1
        );
        check(
            "Grammar.constructor should create a lexical rule.",
            isType(testGrammar.lexicalRules["bar"][0], Rule)
        );
        check(
            "Grammar.constructor should create one binary rule.",
            Object.keys(testGrammar.binaryRules).length === 1
        );
        check(
            "Grammar.constructor should create one rule for $foo_$@bar",
            testGrammar.binaryRules["$foo,$@bar"].length === 1
        );
        check(
            "Grammar.constructor should create a binary rule.",
            isType(testGrammar.binaryRules["$foo,$@bar"][0], Rule)
        );
    }),
    test("Grammar.constructor on Nary rules.", function () {
        const testGrammar = new Grammar(
            ['$Root'],
            basicTokenizer,
            [],
            [
                new Rule(
                    'tag',
                    '$lhs', '$foo $bar $baz',
                    () => null
                )
            ]
        );
        check(
            "Grammar.constructor should create 2 binary rules.",
            Object.keys(testGrammar.binaryRules).length === 2
        );
        check(
            "Grammar.constructor should create one rule for $foo,$bar.",
            testGrammar.binaryRules["$foo,$bar"].length === 1
        );
        check(
            "Grammar.constructor should create a rule for $foo,$bar.",
            isType(testGrammar.binaryRules["$foo,$bar"][0], Rule)
        );
        check(
            "Grammar.constructor should create one rule for $foo_$bar,$baz.",
            testGrammar.binaryRules["$foo_$bar,$baz"].length === 1
        );
        check(
            "Grammar.constructor should create a rule for $foo_$bar,$baz.",
            isType(testGrammar.binaryRules["$foo_$bar,$baz"][0], Rule)
        );
    })
]);


export { Grammar };
