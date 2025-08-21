examples = {
"echo":
`
(
    GRAPH
    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (HOLD X Params)
            (HOLD Result X)
        )
        (TARGET end)
    )
)
`,
"echo-input":
`
xyz
`,

"ping-pong":
`
(
    GRAPH
    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (TEST Params ping)
            (HOLD Result pong)
        )
        (TARGET end)
    )
)
`,
"ping-pong-input":
`
ping
`,

"hi-bye":
`
(
    GRAPH
    
    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (TEST Params hi)
            (HOLD Result greeting)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (TEST Params bye)
            (HOLD Result farewell)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (INSTR (HOLD Result unknown))
        (TARGET end)
    )
)
`,
"hi-bye-input":
`
hi
`,

"foo-bar":
`
(
    GRAPH

    /Step 1: Load input/
    (
        EDGE
        (SOURCE begin)
        (INSTR (HOLD X Params))
        (TARGET check)
    )

    /Step 2: Check for foo/
    (
        EDGE
        (SOURCE check)
        (INSTR (TEST X foo))
        (TARGET match-foo)
    )

    /Step 3: Check for bar/
    (
        EDGE
        (SOURCE check)
        (INSTR (TEST X bar))
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
        (INSTR (HOLD Result alpha))
        (TARGET end)
    )

    /Step 6: Match case bar/
    (
        EDGE
        (SOURCE match-bar)
        (INSTR (HOLD Result beta))
        (TARGET end)
    )

    /Step 7: Default case/
    (
        EDGE
        (SOURCE fallback)
        (INSTR (HOLD Result unknown))
        (TARGET end)
    )
)
`,
"foo-bar-input":
`
foo
`,
"reverse":
`
(
    GRAPH

    /Load Input and initialize accumulator/
    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (HOLD Input Params)
            (HOLD Acc ())
        )
        (TARGET loop)
    )

    /Loop condition: if Input is ()/
    (
        EDGE
        (SOURCE loop)
        (INSTR (TEST Input ()))
        (TARGET done) /go to done/
    )
    
    /Fallback: Process one element/
    (
        EDGE
        (SOURCE loop)
        (
            INSTR
            (HOLD Head (FIRST Input))
            (HOLD Tail (REST Input))
            (HOLD Acc (PREPEND Head Acc))
            (HOLD Input Tail)
        )
        (TARGET loop) /Continue looping/
    )

    /Final step: store reversed Result/
    (
        EDGE
        (SOURCE done)
        (INSTR (HOLD Result Acc))
        (TARGET end)
    )
)
`,
"reverse-input":
`
(1 2 3 4)
`
}

