Thoughts about refactoring and scoping out dashboard.component
==============================================================

1. New presentational component dashboard-ui.component.ts should be created
2. dashboard-ui.component.ts should be scoped out to library
3. Number of pass-though events and properties should be created:
    1. Event for pressing clear all databases
    2. Array properties "rows", "databases"
    3. Property stats
    4. Figure better way of dealing with "labelify" and "getDbCount"
    5. Event "clearDatabase" that passes a "database" name to clear

(something else?)
