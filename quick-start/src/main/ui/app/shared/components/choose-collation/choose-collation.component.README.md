Thoughts on refactoring and scoping out choose-collation.component
==================================================================

1. Looks like the component is completely UI based, with exception of 
"collation" and "actions", which are injected into the
component. The only refactoring needed here is use properties instead of injection.
Other than that, component can be scoped out as is.
