```
// under construction //
```

# symbolprose v0.0.0

_**tags:** s-expression, intermediate-level, imperative-programming_

## about the project

**Imperative programming** is a programming paradigm of software that uses statements that change a program's state. Imperative programming focuses on describing how a program operates step by step rather than on high-level descriptions of its expected results.

An **S-expression** (Symbolic Expression) is a simple and uniform way of representing nested data or code using parentheses to denote lists and atoms, commonly used in Lisp programming and symbolic computation.

_**Symbolprose**_ is a symbolic, imperative programming framework. Its main purpose is to serve as a compiling target for higher level programming languages. Symbolprose instruction control flow is inspired by finite state machines. The code in Symbolprose resembles a directed graph whose nodes represent checkpoints in program execution, while edges host variable accessing instructions.

## minimalistic approach

The entire grammar of Symbolprose code files fits into only six lines of relaxed BNF code:

```
      <start> := (GRAPH (VAR <ATOMIC>+)? <edge>+)

       <edge> := (EDGE (SOURCE <ATOMIC>) (MID <instruction>+)? (TARGET <ATOMIC>))

<instruction> := (TEST <ANY> <ANY>)
               | (HOLD <ATOMIC> <ANY>)
```

and there is only six builtin functions used only for sub-structural transformations:

```
(CONSL <ANY> <ANY>)       -> <RESULT>
(HEADL <ANY>)             -> <RESULT>
(TAILL <ANY>)             -> <RESULT>
(CONSA <ATOMIC> <ATOMIC>) -> <RESULT>
(HEADA <ATOMIC>)          -> <RESULT>
(TAILA <ATOMIC>)          -> <RESULT>
```

Given these elements, in spite of being very minimalistic framework, Symbolprose is computationally complete.

## "Hello world!" example

To get a glimpse on how a Symbolprose program code looks like, we bring the "Hello world!" example:

```
(
    GRAPH
    (
        EDGE
        (SOURCE begin)
        (MID (HOLD <Result> "Hello world!"))
        (TARGET end)
    )
)
```

## resources

There are a some resources about Symbolprose to check out:

- Read the [Symbolprose specification](https://tearflake.github.io/symbolprose/docs/symbolprose).
- ...

## licensing

This software is released under [MIT license](LICENSE).

```
// under construction //
```
