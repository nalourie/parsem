Pars' 'Em!
==========
Semantic parsing for the browser.

Pars' 'Em!, or `parsem`, is a minimal semantic parsing framework written
in javascript and designed for the web browser. Semantic parsing
converts natural language to a machine interpretable format. Pars' 'Em!
currently uses a chart parsing based approach which is well-tailored for
small domain applications that need to run in resource constrained
environments. If you're looking to tackle a larger domain and have ample
compute power available to your application, you may want to consider
a deep learning approach.

The key design characteristics around Pars' 'Em! are:

  - **composability**: parsers should be re-usable and composable so that a
    parser for one application may be reused in another or to build another
    parser.
  - **lightweight**: Pars' 'Em! targets small use cases that need a prototype
    that can be built fast and will run fast, rather than targeting
    accuracy or breadth of coverage.
  - **in the client**: Pars' 'Em! is built in javascript so that it can
    run in a web client or even on a static page.

To dive in check out the [Quickstart](#quickstart) guide down below. If
you want to test out what the library can currently do, see
the [Demo](#demo) section! To contribute
see [Contributing](#contributing).  For other queries take a look
at [Contact](#contact). Finally, if you'd like a more in-depth
introduction to semantic parsing, check out the [SippyCup][sippycup]
jupyter notebooks and if you want a more fully featured semantic parsing
framework take a look at [SemPre][sempre].

**Warning!**: this software is just a prototype and I may or may not
make further updates to it. It's MIT licensed, so do anything you like
with it! However, if you build a system around it, be prepared to make
any changes or updates you may find necessary.


Demo
----
You can find a demo of Pars' 'Em! [here][demo-link].


Quickstart
----------
If you want to use this library, you'll have to vendor and read some
source code; however, this section will give you a quick taste for what
it's like.

Pars' 'Em! comes with a few example semantic parsers
built-in. `parsem.parsers.arithmetic.arithmeticParser` parses natural
language arithmetic expressions. For example:

```
import { arithmeticParser } from './parsem/parsers/arithmetic';

arithmetricParser.parse("What is one plus one?")
```

Will produce an array of instances of the `Derivation` class, which
represents a parse. Each parse has a `computeDenotation` method which
computes the value associated with that parse:

```
arithmetricParser.parse("What is one plus one?")[0].computeDenotation()
```

yields `2`.

To build a parser, you can use the `Grammar` and `Rule` classes, for
example we could encode the above example as:

```
const parser = new Grammar(
  ["$Root"],
  basicTokenizer,
  [],
  [
    new Rule(
      'root',
      '$Root', '$Num',
      x => x
    ),
    new Rule(
      'one',
      '$Num', 'one',
      () => 1
    ),
    new Rule(
      'plus',
      '$Plus', 'plus',
      () => (x, y) => x + y
    ),
    new Rule(
      'applyPlus',
      '$Num', '$Num $Plus $Num',
      (x, y, z) => y(x, z)
    )
  ]
);
```

Each rule consists of a tag identifying that rule, a left hand side
symbol to output, a right hand side sequence of symbols to match to, and
a function that defines the semantics of that rule, where the function
maps the children of the produced parse to the value of the parse itself.

See the [`parsers`][parsers-dir] directory for more examples.


Contributing
------------
This library was built as a side project, and so I have no formal plans
to maintain it. If you write a pull request that has properly tested
code and solves a problem that fits well with the framework, there's a
good chance I'll merge it (and you can always make a fork if I don't).

If you're looking to make a pull request with the aim of merging it,
please open an issue to discuss before you put in the work. All code
contributed must be MIT licensed.


Contact
-------
Need to get in touch? Reach out by emailing contactnick
at [my website][my-website].


[sempre]: https://github.com/percyliang/sempre
[sippycup]: https://github.com/wcmac/sippycup
[demo-link]: http://nicholaslourie.com/parsem/
[parsers-dir]: ./parsem/parsers/
[my-website]: http://nicholaslourie.com/
