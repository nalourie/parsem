import { arithmeticParser } from '../parsem/parsers/arithmetic';
import {
    digitParser,
    numberParser
} from '../parsem/parsers/numbers';


// the parsers object is used to generate a list of parsers in the demo
// that the user can try out.
window.parsers = {
    arithmeticParser,
    digitParser,
    numberParser
}
