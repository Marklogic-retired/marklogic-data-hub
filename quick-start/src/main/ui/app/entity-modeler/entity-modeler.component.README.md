Thoughts about refactoring and scoping out entity-modeler.component
===========================================================

1. New presentational component entity-modeler-ui.component.ts should be created
2. entity-modeler-ui.component.ts should be scoped out to library
3. Unlike others components, entity-modeler is almost all completely UI component. This means
that refactoring should be done other way around: remove services into entity-modeler and 
everything else into entity-modeler-ui. **Caution:** "dialogService" and "snackbar" should
stay as they are presentational Mdl services.
4. **For the future**: this svg code should be removed in favor of better graph library
