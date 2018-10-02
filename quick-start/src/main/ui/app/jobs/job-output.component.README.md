Thoughts on refactoring and scoping out job-output.component
============================================================

1. New presentational component job-output-ui.component.ts should be created
2. job-output-ui.component.ts should be scoped out to library
3. Looks like "jobListener" service dependency should stay with
logic component, everything else can be easily scoped out to the
library.  
