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
            (ASGN X Params)
            (ASGN Result X)
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
            (ASGN Result pong)
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
            (ASGN Result greeting)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (TEST Params bye)
            (ASGN Result farewell)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (INSTR (ASGN Result unknown))
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
        (INSTR (ASGN X Params))
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
        (INSTR (ASGN Result alpha))
        (TARGET end)
    )

    /Step 6: Match case bar/
    (
        EDGE
        (SOURCE match-bar)
        (INSTR (ASGN Result beta))
        (TARGET end)
    )

    /Step 7: Default case/
    (
        EDGE
        (SOURCE fallback)
        (INSTR (ASGN Result unknown))
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
            (ASGN Input Params)
            (ASGN Acc ())
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
            (ASGN Head (FIRST Input))
            (ASGN Tail (REST Input))
            (ASGN Acc (PREPEND Head Acc))
            (ASGN Input Tail)
        )
        (TARGET loop) /Continue looping/
    )

    /Final step: store reversed Result/
    (
        EDGE
        (SOURCE done)
        (INSTR (ASGN Result Acc))
        (TARGET end)
    )
)
`,
"reverse-input":
`
(1 2 3 4)
`,

"element-of":
`
(
    GRAPH

    /Load variables/
    (
        EDGE
        (SOURCE begin)
        (
            INSTR
            (ASGN Element (FIRST Params))
            (ASGN List (FIRST (REST Params)))
        )
        (TARGET loop)
    )
    
    /Loop condition: if Input is ()/
    (
        EDGE
        (SOURCE loop)
        (
            INSTR
            (TEST List ())
            (ASGN Result false)
        )
        (TARGET end) /done/
    )
    
    /Loop condition: if Element is found/
    (
        EDGE
        (SOURCE loop)
        (
            INSTR
            (TEST Element (FIRST List))
            (ASGN Result true)
        )
        (TARGET end) /done/
    )
    
    /Fallback: Process next element in list/
    (
        EDGE
        (SOURCE loop)
        (INSTR (ASGN List (REST List)))
        (TARGET loop) /Continue looping/
    )
)
`,
"element-of-input":
`
(2 (1 2 3 4))
`
}

