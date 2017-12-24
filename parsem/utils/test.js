/* testing utilities. */


/* holds the test suites. */
const suites = {};


/**
 * suite : (String, Array) => null
 * ===============================
 * Define a test suite.
 *
 * `suite` creates a test suite and registers it so that it can be
 * executed later. A test suite groups together related tests, for
 * example all the tests corresponding to a single class or module.
 *
 * @param {String} name - the name of the test suite.
 * @param {Array} tests - a list of tests to add to the suite.
 */
function suite(name, tests) {
    if (!suites.hasOwnProperty(name)) {
        suites[name] = [];
    }
    suites[name].push(...tests);
}


/**
 * test : (String, Function) => null
 * =================================
 * Define a test.
 *
 * A test tests one specific bit of functionality, for example a
 * function or a method. Tests could have some setup and multiple checks
 * that various properties are satisfied.
 *
 * @param {String} description - a description of the functionality
 *   being tested, for example the name of the method or function.
 * @param {Function} execTest - a function taking no arguments that
 *   executes the test.
 */
function test(description, execTest)  {
    return {description, execTest};
}


/**
 * check : (String, Boolean) => null
 * =================================
 * Check that condition is true.
 *
 * `check` is a simple check that a statement is `true`, for use in
 * unit tests. If `condition` is `true` then nothing happens. If
 * `condition` is `false` then a message is printed to console.log.
 *
 * @param {String} description - a description of the purpose of the
 *   test.
 * @param {Boolean} condition - the condition to test. Condition
 *   should be `true` if the test passed, and `false` if the test
 *   failed.
 */
function check(description, condition) {
    if (!condition) {
        console.log("FAILED: " + description);
    }
}
suite('test', [
    test('check', function () {
        check("check should succeed if condition is true", true);
    })
])


/**
 * checkRaises : (String, Function, Error) => null
 * ===============================================
 * Check if a function raises an error when called.
 *
 * `checkRaises` is useful for wrapping a block of code in a thunk (a
 * function of no arguments) and then checking that the block of code
 * raises a specific type of error when executed. Errors of type other
 * than that provided as the `error` argument will not be caught. If no
 * error is raised, a message will be printed to console.log.
 *
 * @param {String} description - a description of the purpose of the
 *   test.
 * @param {Function} thunk - a function of no arguments that executes
 *   the block of code that should raise the error.
 * @param {Error} error - the error that should be raised.
 */
function checkRaises(description, thunk, error) {
    let caught = false;

    try {
        thunk();
    } catch (e) {
        if (e instanceof error) {
            caught = true;
        } else {
            throw e;
        }
    }

    if (!caught) {
        console.log("FAILED: " + description);
    }
}
suite('test', [
    test('checkRaises', function () {
        checkRaises(
            "checkRaises should succeed if the error is raised.",
            function(){
                throw new Error("an error");
            },
            Error
        );
        checkRaises(
            "checkRaises should fail if the wrong error is raised.",
            function(){
                checkRaises(
                    "message",
                    function() { throw new Error("msg"); },
                    TypeError
                )
            },
            Error
        );
    })
]);


/**
 * runSuites : RegExp => null
 * ==========================
 * Run all test suites matching a pattern.
 *
 * Run all tests matching pattern, where pattern is a RegExp. The
 * simplest pattern to match is ".*" which matches everything.
 *
 * @param {RegExp} pattern - the pattern to match against suite names to
 *   determine which test suites should be run.
 */
function runSuites(pattern) {
    for (let suite in suites) {
        if (pattern.test(suite)) {
            for (let i = 0; i < suites[suite].length; i++) {
                const testCase = suites[suite][i];

                const description = testCase['description'];
                const execTest = testCase['execTest'];

                execTest();
            }
        }
    }
}


export {
    check,
    checkRaises,
    suite,
    test,
    runSuites
};
