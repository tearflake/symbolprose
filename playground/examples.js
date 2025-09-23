examples = {
"echo":
`
(GRAPH
   (EDGE
        (SOURCE BEGIN)
        (INSTR
            (ASGN x PARAMS)
            (ASGN RESULT x))
        (TARGET END)))
`,
"echo-input":
`
xyz
`,

"ping-pong":
`
(GRAPH
   (EDGE
        (SOURCE BEGIN)
        (INSTR
            (TEST PARAMS "ping")
            (ASGN RESULT "pong"))
        (TARGET END)))
`,
"ping-pong-input":
`
ping
`,

"hi-bye":
`
(GRAPH
    (EDGE
        (SOURCE BEGIN)
        (INSTR
            (TEST PARAMS "hi")
            (ASGN RESULT "greeting"))
        (TARGET END))

    (EDGE
        (SOURCE BEGIN)
        (INSTR
            (TEST PARAMS "bye")
            (ASGN RESULT "farewell"))
        (TARGET END))

    (EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN RESULT "unknown"))
        (TARGET END)))
`,
"hi-bye-input":
`
hi
`,

"foo-bar":
`
(GRAPH

    // Step 1: Load input
    (EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN x PARAMS))
        (TARGET check))

    // Step 2: Check for foo
    (EDGE
        (SOURCE check)
        (INSTR (TEST x "foo"))
        (TARGET match-foo))

    // Step 3: Check for bar
    (EDGE
        (SOURCE check)
        (INSTR (TEST x "bar"))
        (TARGET match-bar))

    // Step 4: Fallback if no match
    (EDGE
        (SOURCE check)
        (TARGET fallback))

    // Step 5: Match case foo
    (EDGE (SOURCE match-foo)
        (INSTR (ASGN RESULT "alpha"))
        (TARGET END))

    // Step 6: Match case bar
    (EDGE
        (SOURCE match-bar)
        (INSTR (ASGN RESULT "beta"))
        (TARGET END))

    // Step 7: Default case
    (EDGE
        (SOURCE fallback)
        (INSTR (ASGN RESULT "unknown"))
        (TARGET END)))
`,
"foo-bar-input":
`
foo
`,
"reverse":
`
(GRAPH

    // Load Input and initialize accumulator
    (EDGE
        (SOURCE BEGIN)
        (INSTR
            (ASGN input PARAMS)
            (ASGN acc ()))
        (TARGET loop))

    // Loop condition: if input is ()
    (EDGE
        (SOURCE loop)
        (INSTR (TEST input ()))
        (TARGET done)) // go to done
    
    // Fallback: Process one element
    (EDGE
        (SOURCE loop)
        (INSTR
            (ASGN head (RUN stdlib (first input)))
            (ASGN tail (RUN stdlib (rest input)))
            (ASGN acc (RUN stdlib (prepend head acc)))
            (ASGN input tail))
        (TARGET loop)) // Continue looping

    // Final step: store reversed RESULT
    (EDGE
        (SOURCE done)
        (INSTR (ASGN RESULT acc))
        (TARGET END)))
`,
"reverse-input":
`
(1 2 3 4)
`,

"is-element-of":
`
(GRAPH

    // Load variables
    (EDGE
        (SOURCE BEGIN)
        (INSTR
            (ASGN element (RUN stdlib (nth "0" PARAMS)))
            (ASGN list    (RUN stdlib (nth "1" PARAMS))))
        (TARGET loop))
    
    // Loop condition: if input is ()
    (EDGE
        (SOURCE loop)
        (INSTR
            (TEST list ())
            (ASGN RESULT "false"))
        (TARGET END)) // done
    
    // Loop condition: if element is found
    (EDGE
        (SOURCE loop)
        (INSTR
            (TEST element (RUN stdlib (first list)))
            (ASGN RESULT "true"))
        (TARGET END)) // done
    
    // Fallback: process next element in list
    (EDGE
        (SOURCE loop)
        (INSTR (ASGN list (RUN stdlib (rest list))))
        (TARGET loop))) // Continue looping
`,
"is-element-of-input":
`
(2 (1 2 3 4))
`,

"factorial":
`
(GRAPH
    (COMPUTE
        (NAME fact)
        (GRAPH
            
            // Base case: if PARAMS == 0 -> return 1
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (TEST PARAMS "0")
                    (ASGN RESULT "1"))
                (TARGET END))

            // Recursive case
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (ASGN n PARAMS)
                    (ASGN n1 (RUN stdlib (sub n "1")))
                    (ASGN rec (RUN fact n1))
                    (ASGN RESULT (RUN stdlib (mul n rec))))
                (TARGET END))))

    // Top-level call
    (EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN RESULT (RUN fact PARAMS)))
        (TARGET END)))
`,
"factorial-input":
`
5
`,

"fib":
`
(GRAPH
    (COMPUTE
        (NAME fib)
        (GRAPH
            
            // fib(0) -> 0
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (TEST PARAMS "0")
                    (ASGN RESULT "0"))
                (TARGET END))

            // fib(1) -> 1
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (TEST PARAMS "1")
                    (ASGN RESULT "1"))
                (TARGET END))

            // fib(n) -> fib(n - 1) + fib(n - 2)
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (ASGN n1 "0")
                    (ASGN n2 "1")
                    (ASGN i "1"))
                (TARGET loop))

            (EDGE
                (SOURCE loop)
                (INSTR
                    (TEST i PARAMS)
                    (ASGN RESULT n3))
                (TARGET END))

            (EDGE
                (SOURCE loop)
                (INSTR
                    (ASGN n3 (RUN stdlib (add n1 n2)))
                    (ASGN n1 n2)
                    (ASGN n2 n3)
                    (ASGN i (RUN stdlib (add i "1"))))
                (TARGET loop))))

    // Top-level call
    (EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN RESULT (RUN fib PARAMS)))
        (TARGET END)))
`,
"fib-input":
`
120
`
}

