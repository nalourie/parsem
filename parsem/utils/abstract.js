/* utilities for creating abstract classes. */

import { BaseError } from './error';


/**
 * AbstractClassError
 * ==================
 * The error thrown when attempting to instantiate an AbstractClass.
 */
class AbstractClassError extends BaseError {}


/**
 * NotImplementedError
 * ===================
 * The error thrown when a subclass does not implement a method.
 */
class NotImplementedError extends BaseError {}


export {
    AbstractClassError,
    NotImplementedError
};
