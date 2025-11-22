# Entry Points

## Invocation Model
- Entry points are functions in your script that Switch calls at specific times (e.g., per job or timer).
- First two parameters are always `Switch` and `FlowElement` instances; most should be `async`.
- Script must define at least one of `jobArrived` or `timerFired`.
- Some entry points may run without an active job/flow context; avoid job-dependent calls (e.g., `createJob`) unless documented as safe.

## Common Entry Points
- `jobArrived(switchCtx, flowElement, job)`: called per incoming job.
- `timerFired(switchCtx, flowElement, timerId)`: called on timer events.
- Additional entry points exist for property validation and other lifecycle hooks; implement as needed per Switch scripting reference.

## Expressions vs Elements
- Script expressions are evaluated inline and are read-only; entry points run full scripts with broader API access.
