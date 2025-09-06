examples = {
"echo":
`
(GRAPH
   (EDGE
        (SOURCE BEGIN)
        (INSTR
            (ASGN X PARAMS)
            (ASGN RESULT X))
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
            (TEST PARAMS ping)
            (ASGN RESULT pong))
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
            (TEST PARAMS hi)
            (ASGN RESULT greeting))
        (TARGET END))

    (EDGE
        (SOURCE BEGIN)
        (INSTR
            (TEST PARAMS bye)
            (ASGN RESULT farewell))
        (TARGET END))

    (EDGE
        (SOURCE BEGIN)
        (INSTR (ASGN RESULT unknown))
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
        (INSTR (ASGN X PARAMS))
        (TARGET check))

    // Step 2: Check for foo
    (EDGE
        (SOURCE check)
        (INSTR (TEST X foo))
        (TARGET match-foo))

    // Step 3: Check for bar
    (EDGE
        (SOURCE check)
        (INSTR (TEST X bar))
        (TARGET match-bar))

    // Step 4: Fallback if no match
    (EDGE
        (SOURCE check)
        (TARGET fallback))

    // Step 5: Match case foo
    (EDGE (SOURCE match-foo)
        (INSTR (ASGN RESULT alpha))
        (TARGET END))

    // Step 6: Match case bar
    (EDGE
        (SOURCE match-bar)
        (INSTR (ASGN RESULT beta))
        (TARGET END))

    // Step 7: Default case
    (EDGE
        (SOURCE fallback)
        (INSTR (ASGN RESULT unknown))
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
            (ASGN Input PARAMS)
            (ASGN Acc ()))
        (TARGET loop))

    // Loop condition: if Input is ()
    (EDGE
        (SOURCE loop)
        (INSTR (TEST Input ()))
        (TARGET done)) // go to done
    
    // Fallback: Process one element
    (EDGE
        (SOURCE loop)
        (INSTR
            (ASGN Head (RUN stdlib (first Input)))
            (ASGN Tail (RUN stdlib (rest Input)))
            (ASGN Acc (RUN stdlib (prepend Head Acc)))
            (ASGN Input Tail))
        (TARGET loop)) // Continue looping

    // Final step: store reversed RESULT
    (EDGE
        (SOURCE done)
        (INSTR (ASGN RESULT Acc))
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
            (ASGN Element (RUN stdlib (first PARAMS)))
            (ASGN List (RUN stdlib (first (RUN stdlib (rest PARAMS))))))
        (TARGET loop))
    
    // Loop condition: if Input is ()
    (EDGE
        (SOURCE loop)
        (INSTR
            (TEST List ())
            (ASGN RESULT false))
        (TARGET END)) // done
    
    // Loop condition: if Element is found
    (EDGE
        (SOURCE loop)
        (INSTR
            (TEST Element (RUN stdlib (first List)))
            (ASGN RESULT true))
        (TARGET END)) // done
    
    // Fallback: process next element in list
    (EDGE
        (SOURCE loop)
        (INSTR (ASGN List (RUN stdlib (rest List))))
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
                    (TEST PARAMS 0)
                    (ASGN RESULT 1))
                (TARGET END))

            // Recursive case
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (ASGN n PARAMS)
                    (ASGN n1 (RUN stdlib (sub n 1)))
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
            
            // fib(0) -> (0)
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (TEST PARAMS 0)
                    (ASGN RESULT (0)))
                (TARGET END))

            // fib(1) -> (0 1)
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (TEST PARAMS 1)
                    (ASGN RESULT (0 1)))
                (TARGET END))

            // fib(n) -> fib(n - 1) + fib(n - 2)
            (EDGE
                (SOURCE BEGIN)
                (INSTR
                    (ASGN i 1)
                    (ASGN acc (0 1)))
                (TARGET loop))

            (EDGE
                (SOURCE loop)
                (INSTR
                    (TEST i PARAMS)
                    (ASGN RESULT acc))
                (TARGET END))

            (EDGE
                (SOURCE loop)
                (INSTR
                    (ASGN n1 (RUN stdlib (sub (RUN stdlib (lstlen acc)) 1)))
                    (ASGN n2 (RUN stdlib (sub n1 1)))
                    (ASGN f (RUN stdlib (add (RUN stdlib (nth n1 acc)) (RUN stdlib (nth n2 acc)))))
                    (ASGN acc (RUN stdlib (append acc f)))
                    (ASGN i (RUN stdlib (add i 1))))
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

