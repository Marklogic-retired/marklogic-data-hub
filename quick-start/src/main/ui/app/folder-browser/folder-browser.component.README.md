Thoughts on refactoring and scoping out folder-browser.component
================================================================

1. New presentational component folder-browser-ui.component.ts should be created
2. folder-browser-ui.component.ts should be scoped out to library
3. Mostly the component is ready to scope out, except "http" injection
that needed to be refactored. 

**Note:** the best way is to use state management
service like Redux (ngrx) instead of direct call to http. 
