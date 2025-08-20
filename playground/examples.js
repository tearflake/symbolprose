examples = {
"echo":
`
(
    GRAPH
    (
        EDGE
        (SOURCE begin)
        (
            MID
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
            MID
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
            MID
            (TEST Params hi)
            (HOLD Result greeting)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (
            MID
            (TEST Params bye)
            (HOLD Result farewell)
        )
        (TARGET end)
    )

    (
        EDGE
        (SOURCE begin)
        (MID (HOLD Result unknown))
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
        (MID (HOLD X Params))
        (TARGET check)
    )

    /Step 2: Check for foo/
    (
        EDGE
        (SOURCE check)
        (MID (TEST X foo))
        (TARGET match-foo)
    )

    /Step 3: Check for bar/
    (
        EDGE (SOURCE check)
        (MID (TEST X bar))
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
        (MID (HOLD Result alpha))
        (TARGET end)
    )

    /Step 6: Match case bar/
    (
        EDGE
        (SOURCE match-bar)
        (MID (HOLD Result beta))
        (TARGET end)
    )

    /Step 7: Default case/
    (
        EDGE (SOURCE fallback)
        (MID (HOLD Result unknown))
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
   (VAR Input Acc Head Tail)

   /Load Input and initialize accumulator/
   (
     EDGE
     (SOURCE begin)
     (
       MID
       (HOLD Input Params)
       (HOLD Acc ())
     )
     (TARGET loop)
   )

   /Loop condition: if Input is not (), process one element/
   (
     EDGE
     (SOURCE loop)
     (MID (TEST Input ()))
     (TARGET done) /If Input is (), go to done/
   )
   
   (
     EDGE
     (SOURCE loop)
     (
       MID
       (HOLD Head (first Input))
       (HOLD Tail (rest Input))
       (HOLD Acc (prepend Head Acc))
       (HOLD Input Tail)
     )
     (TARGET loop) /Continue looping/
   )

   /Final step: store reversed Result/
   (
     EDGE
     (SOURCE done)
     (MID (HOLD Result Acc))
     (TARGET end)
   )
)
`,
"reverse-input":
`
(1 2 3 4)
`
}

