/* Derivations are parses produced by grammars. */

import { Parse } from '../parse/parse';


/**
 * Derivation
 * ==========
 * A parse produced by a grammar.
 *
 * Methods
 * -------
 * See `Parse` for additional methods.
 *
 * Attributes
 * ----------
 * rule : Rule
 *   The rule used to produce the derivation.
 *
 * See `Parse` for additional attributes.
 */
class Derivation extends Parse {
    constructor(rule, span, children) {
        super(rule.tag, rule.lhs, span, children, rule.semantics);

        // methods

        // attributes

        this.rule = rule;
    }
}


export { Derivation };
