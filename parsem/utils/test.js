/* testing utilities. */


/**
 * check : (String, Boolean) -> null
 * =================================
 * Check that condition is true.
 *
 * `check` is a simple unit test. If `condition` is `true` then nothing
 * happens. If `condition` is `false` then a message is printed to
 * console.log.
 *
 * @param {String} description - a description of the purpose of the
 *   test.
 * @param {Boolean} condition - the condition to test. Condition should
 *   be `true` if the test passed, and `false` if the test failed.
 */
function check(description, condition) {
    if (!condition) {
        console.log("FAILED: " + description);
    }
}
// uncomment test below to check that check will fail
// check("check should fail if condition is false.", false);
check("check should succeed if condition is true", true);


/**
 * checkRaises : (String, Function, Error) -> null
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
// uncomment test below to test that checkRaises will fail.
// checkRaises(
//     "checkRaises should fail if an error is not raised.",
//     function(){},
//     Error
// );
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


export { check, checkRaises };
