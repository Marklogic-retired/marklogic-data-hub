Thoughts on refactoring and scoping out app.component
=====================================================

1. New presentational component app-root.component.ts should be created
2. app-root.component.ts should be scoped out
3. The style for app-root hardcoded in index.html should be moved to app-root.component.scss
4. app-root.component.ts should only contain one @Input property "canShowHeader" and headerOffset() function
5. headerOffset should be refactored correspondingly to reflect "canShowHeader" property.
