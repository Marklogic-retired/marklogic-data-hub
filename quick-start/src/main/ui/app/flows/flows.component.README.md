Thoughts on refactoring and scoping out flows.component
========================================================

1. New presentational component flows-ui.component.ts should be created
2. flows-ui.component.ts should be scoped out to library
3. The refactor should be very careful as there are number of dependencies like:
    1. codemirror.component.ts
    2. harmonize-flow-options.component.ts
    3. mlcp-ui.component.ts


