Thoughts on refactoring and scoping out jobs.component
========================================================

1. New presentational component jobs-ui.component.ts should be created
2. jobs-ui.component.ts should be scoped out to library
3. The only injected service that need to remain in presentation is
"dialogService", all others should remain in logic component
4. Watch dependencies on "date-pipe", "app-facets" and "app-pagenation" these 
needed to be scoped first.
