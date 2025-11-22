# timer-fired-basic (tags: timer, logging)

- Tested on: Switch 2024 Fall, Node 20
- Scenario: Log a heartbeat message on each timer tick; demonstrates `timerFired` and `LogLevel`.
- Prereq: Script element with at least one outgoing connection; set "Enable debug mode" to No.

```ts
// main.ts
import { FlowElement, LogLevel, Switch } from "switch-scripting";

export async function timerFired(s: Switch, flowElement: FlowElement) {
  // Adjust interval if needed (only call from timerFired)
  flowElement.setTimerInterval(120); // 2 minutes

  await flowElement.log(LogLevel.Info, "Heartbeat at %1", [new Date().toISOString()]);
}
```

- Notes: `setTimerInterval` must be called inside `timerFired`; default is 300s. If using debug mode, entry points are serialized and only one Node.js script can be debugged at a time.
