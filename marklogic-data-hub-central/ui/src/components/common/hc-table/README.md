# Table component migration tips

## Properties changed
* `dataSource -> data`

### Column factory object
* `title -> text`
* `dataField -> dataIndex`
* `render() -> formatter()`
* `ReactNode` on `title`: now it is advised to use `headerAttrs` to add properties instead of `<span>` elements or similar

## Implementation details
* Pagination API: TBD
* Expand and collapse: [API](https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Row%20Expand&selectedStory=Basic%20Row%20Expand&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel)
    * Collapsible rows need numeric arrays / keys instead of string arrays (see `entity-type-table.tsx`).
* Searching and filtering: There is an extension library called [react-bootstrap-table2-filter](https://www.npmjs.com/package/react-bootstrap-table2-filter) that adds a `filter` property to the `<BootstrapTable />` to allow filtering options managed with another method
* Nested and structured data: the idea is to build on the `formatter` method of the column definition where applicable.

