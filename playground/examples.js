examples = {
"echo":
`
(
    GRAPH

    (
        EDGE
        (SOURCE BEGIN)
        (
            INSTR
            (ASGN X PARAMS)
            (ASGN RESULT X)
        )
        (TARGET END)
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
        (SOURCE BEGIN)
        (
            INSTR
            (TEST PARAMS ping)
            (ASGN RESULT pong)
        )
        (TARGET END)
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
        (SOURCE BEGIN)
        (
            INSTR
            (TEST PARAMS hi)
            (ASGN RESULT greeting)
        )
        (TARGET END)
    )

    (
        EDGE
        (SOURCE BEGIN)
        (
            INSTR
            (TEST PARAMS bye)
            (ASGN RESULT farewell)
        )
        (TARGET END)
    )

    (
        EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN RESULT unknown))
        (TARGET END)
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

    //Step 1: Load input
    (
        EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN X PARAMS))
        (TARGET check)
    )

    //Step 2: Check for foo
    (
        EDGE
        (SOURCE check)
        (INSTR (TEST X foo))
        (TARGET match-foo)
    )

    //Step 3: Check for bar
    (
        EDGE
        (SOURCE check)
        (INSTR (TEST X bar))
        (TARGET match-bar)
    )

    //Step 4: Fallback if no match
    (
        EDGE
        (SOURCE check)
        (TARGET fallback)
    )

    //Step 5: Match case foo
    (
        EDGE (SOURCE match-foo)
        (INSTR (ASGN RESULT alpha))
        (TARGET END)
    )

    //Step 6: Match case bar
    (
        EDGE
        (SOURCE match-bar)
        (INSTR (ASGN RESULT beta))
        (TARGET END)
    )

    //Step 7: Default case
    (
        EDGE
        (SOURCE fallback)
        (INSTR (ASGN RESULT unknown))
        (TARGET END)
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

    //Load Input and initialize accumulator
    (
        EDGE
        (SOURCE BEGIN)
        (
            INSTR
            (ASGN Input PARAMS)
            (ASGN Acc ())
        )
        (TARGET loop)
    )

    //Loop condition: if Input is ()
    (
        EDGE
        (SOURCE loop)
        (INSTR (TEST Input ()))
        (TARGET done) //go to done
    )
    
    //Fallback: Process one element
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
        (TARGET loop) //Continue looping
    )

    //Final step: store reversed RESULT
    (
        EDGE
        (SOURCE done)
        (INSTR (ASGN RESULT Acc))
        (TARGET END)
    )
)
`,
"reverse-input":
`
(1 2 3 4)
`,

"is-element-of":
`
(
    GRAPH

    //Load variables
    (
        EDGE
        (SOURCE BEGIN)
        (
            INSTR
            (ASGN Element (FIRST PARAMS))
            (ASGN List (FIRST (REST PARAMS)))
        )
        (TARGET loop)
    )
    
    //Loop condition: if Input is ()
    (
        EDGE
        (SOURCE loop)
        (
            INSTR
            (TEST List ())
            (ASGN RESULT false)
        )
        (TARGET END) //done
    )
    
    //Loop condition: if Element is found
    (
        EDGE
        (SOURCE loop)
        (
            INSTR
            (TEST Element (FIRST List))
            (ASGN RESULT true)
        )
        (TARGET END) //done
    )
    
    //Fallback: process next element in list
    (
        EDGE
        (SOURCE loop)
        (INSTR (ASGN List (REST List)))
        (TARGET loop) //Continue looping
    )
)
`,
"is-element-of-input":
`
(2 (1 2 3 4))
`
}

