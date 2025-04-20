
    // under construction //

# symbolprose

> **[about document]**  
> Introduction to *Symbolprose* imperative programming system operating on S-expressions.
>
> **[intended audience]**  
> Advanced users in imperative programming
> 
> **[Abstract]**  
> ...Symbolprose resembles a directed graph structure where instruction execution flow follows the graph edges from beginning to ending node, possibly over intermediate nodes. The graph edges host instruction sequences that query and modify global variables to produce the final result relative to the passed parameters. The execution is deterministic where multiple edges from the same node may be tested canonically to succeed, repetitively transitioning to the next node in the total execution sequence...

## table of contents

- [1. introduction](#1-introduction)  
- [2. theoretical background](#2-theoretical-background)  
    - [2.1. syntax](#21-syntax)  
    - [2.2. semantics](#22-semantics)  
- [3. practical examples](#3-practical-examples)  
- [4. conclusion](#4-conclusion)  

## 1. introduction

*Symbolprose* aims to be a minimalistic and simplistic platform defined by very simple syntax and simple computing rules. It is intended to be relatively fast and computationally complete compilation target platform for other, more user friendly languages.

Symbolprose implements a control flow of imperative programming paradigm in its own way where the sequential assignment of values to variables remains the key to computation, but the branching rules take their own implicit form inspired by finite state machines. In an attempt to make it as simple as possible, its implementation does not bother with constructs such as function and procedure declarations because the framework is meant to be plugged into a controlling system that specifically handles such declaration constructs.

In this exposure we will skim over syntax, semantics, and a few representative examples of coding in Symbolprose. Since the matter covered by this exposure indirectly relates to the concept of compiling to Symbolprose target virtual machine, novice programmers probably won't find this report very interesting, but the more advanced programmers may find something of their interest. The unusual approach to programming from the perspective of Symbolprose might be worth investigating by even a bit of curious programmers.

## 2. theoretical background

Symbolprose is a computing platform that operates on S-expressions. S-expression (or symbolic expression) is a data structure that may be represented by an atomic value or a list of other S-expressions, thus possibly constituting elements, lists and trees of data. It is popularized by the Lisp programming language which emphasizes S-expression suitability to represent both code and data.

Coding in Symbolprose is inspired by a structure of finite state machines (FSM). FSMs belong to a class of automata that can be in one of a finite set of states during the program execution. As the FSM program executes, the state transition process is guiding its current actions and responsiveness to outside events. FSMs are easily represented by directed graphs with nodes representing states and edges representing transitions. 

Likewise, Symbolprose resembles a directed graph structure where instruction execution flow follows the graph edges from beginning to ending node, possibly over intermediate nodes. The graph edges host instruction sequences that query and modify global variables to produce the final result relative to the passed parameters. The execution is deterministic where multiple edges from the same node may be tested canonically to succeed, repetitively transitioning to the next node in the total execution sequence.

Symbolprose is made Turing complete since it is intended to host a variety of code formations compiled from arbitrary higher level programming frameworks. It represents an abstract computing platform where we can extract any symbolic result from any symbolic parameters, depending on the programming code we run within Symbolprose definition bounds.

### 2.1 syntax

In computer science, the syntax of a computer language is the set of rules that defines the combinations of symbols that are considered to be correctly structured statements or expressions in that language. Symbolprose code itself resembles a kind of S-expression. In Symbolprose code, the first list element to the left determines a type of a list. There are a few predefined list types used for coding, depicted by the following relaxed kind of Backus-Naur form syntax rules:

```
          <start> := (GRAPH (VAR <ATOMIC>+)? <edge>+)

           <edge> := (EDGE (SOURCE <ATOMIC>) (MID <instruction>+)? (TARGET <ATOMIC>))

    <instruction> := (TEST <ANY> <ANY>)
                   | (HOLD <ATOMIC> <ANY>)
```

To interpret these grammar rules, we use special symbols: `<...>` for noting identifiers, `... := ...` for expressing assignment, `...+` for one or more occurrences, `...*` for zero or more occurrences, `...?` for optional appearance, and `... | ...` for alternation between expressions. All other symbols are considered as parts of the Symbolprose language.

As an interleaved part of the above grammar, anywhere inside `<ANY>` elements, there may be placed any of the six builtin functions:  

```
(CONSA <ATOMIC> <ATOMIC>) -> <RESULT>
(HEADA <ATOMIC>)          -> <RESULT>
(TAILA <ATOMIC>)          -> <RESULT>
(CONSL <ANY> <ANY>)       -> <RESULT>
(HEADL <ANY>)             -> <RESULT>
(TAILL <ANY>)             -> <RESULT>
```

In addition to the exposed grammar, user comments have no meaning to the system, but may be descriptive to readers, and may be placed wherever a whitespace is expected. Single line comments are embraced within a pair of `/` symbols. Multiline comments are embraced within an odd number of `/` symbols placed at the same whitespace distance from the beginning of line, so that everything in between is considered as a comment.

### 2.2. semantics

Semantics of Symbolprose, as a study of meaning, reference, or truth of Symbolprose, may be defined in different ways. For this occasion, we choose a nested bulleted list explanation of how different Symbolprose elements behave:

- A program is contained within the `(GRAPH ...)` clause  
    - Variables  
        - Optionally declare named variables with a `(VAR …)` clause. Variables are recommended to be named with `<` prefix and `>` suffix to differentiate them from other atoms.  
        - Built‑in variable `<Params>` contains the incoming parameter S-expression. Before program start, `<` and `>` characters in the `<Params>` are automatically replaced with `&lt;` and `&gt;` strings, respectively.  
        - Builtin variable `<Result>` is where the final output S-expression must be stored. After program end, `&lt;` and `&gt;` substrings in the `<Result>` are automatically replaced with `<` and `>` characters, respectively.  
    - Edges  
        - Each `(EDGE ...)` specifies a `SOURCE` node, optional `MID` instructions, and a `TARGET` node.  
            - Execution of a program follows the graph model. The graph begins at the special node `begin` and terminates at `end`.  
            - Instructions (in `MID`)  
                - `(TEST <expr1> <expr2>)`  
                    - Evaluate `<expr1>` and `<expr2>` and compare them.  
                    - If equal, continue; otherwise skip to the next outgoing edge.  
                - `(HOLD <var> <expr>)`  
                    - Evaluate `<expr>` and bind its value to `<var>`.  
        - Outgoing edges from a given node are evaluated in declaration order; the first whose `TEST`s all pass is taken.  
        - If there are no more edges to try, execution halts with an error.  
- Built‑in Functions  
    - String (Atom) operations:  
        - `(CONSA <a1> <a2>)` prepends atom `<a1>` to atom `<a2>`  
        - `(HEADA <a>)` returns the first character of the atom `<a>`  
        - `(TAILA <a>)` returns the rest of the atom `<a>`  
    - List (S‑expression) operations:  
        - `(CONSL <l1> <l2>)` prepends element `<l1>` to the list `<l2>`  
        - `(HEADL <l>)` returns the first element of the list `<l>`  
        - `(TAILL <l>)` returns the remaining elements of the list `<l>`  

Hopefully complete enough, the above structured explanation may serve as a semantic specification of Symbolprose. But since the theory is only one side of a medal in a learning process, the rest of this exposure deals with various examples of coding in Symbolprose, possibly completing the definition process.

## 3. tutorial examples

We selected a few representative examples to study how Symbolprose behaves in different situations. These examples should be simple enough even for novice programmers to follow, thus revealing the Symbolprose execution process in practice. Nevertheless, the examples serve merely as an indication to possibilities that can be brought to light by an eye of more experienced programmers.

### `<Params>` and `<Result>`variables

The first example takes any S-expression as a parameter, and simply returns it unchanged as a result:

```
(
    GRAPH
    (VAR <X>)
    (
        EDGE
        (SOURCE begin)
        (
            MID
            (HOLD <X> <Params>)
            (HOLD <Result> <X>)
        )
        (TARGET end)
    )
)
```

We used a variable `<X>` as a helper to show that `(MID ...)` clause can hold more than one instruction in a sequence.

### test condition

The next example accepts an S-expression as a parameter. If the expression equals `ping`, the example returns `pong`. Otherwise it halts reporting a runtime error. To have the code functioning this way, we use `(TEST ...)` clause that either continues to the next instruction, or tries to fall to the next, non existing branch:

```
(
    GRAPH
    (
        EDGE
        (SOURCE begin)
        (
            MID
            (TEST <Params> ping)
            (HOLD <Result> pong)
        )
        (TARGET end)
    )
)
```

### multiple nodes

Of course, we can have multiple edges from the same node. The following example takes `hi`, `bye`, or something else as a parameter. If the parameter is `hi`, it returns `greeting`. If the parameter is `bye`, it returns `farewell`. Otherwise, the code fallbacks returning `unknown` as a result:

```
(
    GRAPH

    (
        EDGE
        (SOURCE begin)
        (
            MID
            (TEST <Params> hi)
            (HOLD <Result> greeting)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (
            MID
            (TEST <Params> bye)
            (HOLD <Result> farewell)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (MID (HOLD <Result> unknown))
        (TARGET end)
    )
)
```

### multiple intermediate nodes

We can also have multiple intermediate nodes between `begin` and `end` nodes. In this example, if we pass `foo`, we get `alpha`. If we pass `bar`, we get `beta`. Otherwise, we get `unknown`:

```
(
    GRAPH
    (VAR <X>)

    /Step 1: Load input/
    (
        EDGE
        (SOURCE begin)
        (MID (HOLD <X> <Params>))
        (TARGET check)
    )

    /Step 2: Check for foo/
    (
        EDGE
        (SOURCE check)
        (MID (TEST <X> foo))
        (TARGET match-foo)
    )

    /Step 3: Check for bar/
    (
        EDGE (SOURCE check)
        (MID (TEST <X> bar))
        (TARGET match-bar)
    )

    /Step 4: Fallback if no match/
    (
        EDGE
        (SOURCE check)
        (TARGET fallback)
    )

    /Step 5: Match case foo/
    (
        EDGE (SOURCE match-foo)
        (MID (HOLD <Result> alpha))
        (TARGET end)
    )

    /Step 6: Match case bar/
    (
        EDGE
        (SOURCE match-bar)
        (MID (HOLD <Result> beta))
        (TARGET end)
    )

    /Step 7: Default case/
    (
        EDGE (SOURCE fallback)
        (MID (HOLD <Result> unknown))
        (TARGET end)
    )
)
```

### looping

Finally, we get to a more interesting example of reversing a list. To do this, we make use of `HEADL`, `TAILL`, and `CONSL` builtin functions:

```
(
    GRAPH
    (VAR <Input> <Acc> <Head> <Tail>)

    /Load <Input> and initialize accumulator/
    (
        EDGE
        (SOURCE begin)
        (
            MID
            (HOLD <Input> <Params>)
            (HOLD <Acc> ())
        )
        (TARGET loop)
    )

    /Loop condition: if <Input> is not (), process one element/
    (
        EDGE
        (SOURCE loop)
        (MID (TEST <Input> ()))
        (TARGET done) /If <Input> is (), go to done/
    )
    
    (
        EDGE
        (SOURCE loop)
        (
            MID
            (HOLD <Head> (HEADL <Input>))
            (HOLD <Tail> (TAILL <Input>))
            (HOLD <Acc> (CONSL <Head> <Acc>))
            (HOLD <Input> <Tail>)
        )
        (TARGET loop) /Continue looping/
    )

    /Final step: store reversed <Result>/
    (
        EDGE
        (SOURCE done)
        (MID (HOLD <Result> <Acc>))
        (TARGET end)
    )
)
```

In this example, we are using several variables. `<Input>` is the list we're consuming. `<Acc>` is the accumulator we build the reversed list into. In the code, there is a loop going on where in each iteration we do:

- extract the `<Head>`
- push it to the front of `<Acc>`
- update `<Input>` to its `<Tail>`
- loop ends when `<Input>` equals `()`
- in the final step, the value of <Acc> becomes <Result>

Thus, when we pass `(1 2 3)`, we get `(3 2 1)`. Similarly, we can use `HEADA`, `TAILA`, and `CONSA` builtin functions to reverse a string (e.g. from `123` we get `321`).

## 4. conclusion

Symbolprose introduces a minimal imperative programming framework based on a graph oriented execution model and symbolic expression syntax. Program control flow is expressed through nodes and edges, where instruction sequences are evaluated deterministically to produce a result based on input parameters.

This document covered the essential aspects of Symbolprose, including its syntax rules, execution semantics, and the role of builtin operations. Through several examples, we demonstrated how branching, iteration, and data transformation can be implemented within this structure using a small set of rules.

As a lightweight platform, Symbolprose may be useful in contexts that benefit from structured symbolic computation and deterministic evaluation. Its design is especially suited for serving as an intermediate representation or as part of a controlled execution environment.

    // under construction //

