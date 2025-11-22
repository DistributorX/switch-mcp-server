This file contains the current to do items for this project.

## Scope
Create a simple MCP so that AI agents running in CLI or VS Code can access the Enfocus Switch Scripting Guide. We currently have some poorly structured Enfocus Switch Scripting documentation in: `old-switch-manual`. We will restructure this so that it can be accessed by a LLM model using MCP. First we will recreate the documentation with this goal in mind, so that it is well structured for an LLM. Then we will discuss creating a simple MCP server to use this documentation. Then we will create the MCP implementation.


## To Do Items
- [x] Initialize codex
- [x] Recreate the exisitng documentation into `mcp-switch-manual` folder. _(Complete: full chapters copied; add finer-grained MCP chunks next.)_
- [ ] Discuss what type of MCP server to create and how to create it.
- [ ] Create an MCP server that uses this new documentation so that a user working on a Enfocus Switch script project can ask the LLM to query the documentation and get answers on how best to use the Enfocus Switch scripting language additions & requirements etc. for TypeScript
- [ ] Design a pattern for curated code examples (Switch-tested) and surface them via MCP (e.g., `examples/` folder with metadata + references in docs). Add guidance for contributing/validating snippets.
