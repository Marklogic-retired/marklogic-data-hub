// Steps for guided tour depending on each view.
const viewSteps = [
  {
    selector: '[class*="View_statsContainer"]',
    content: 'Here are the number of entities and total number of documents.'
  },
  {
    selector: '.ant-table-body',
    content: 'The table shows each entity, total documents per entity, and last harmonized date per entity.'
  },
  {
    selector: '.ant-table-row-expand-icon',
    content: 'Expansion button will show all the properties of each entity.'
  }
];

const browseSteps = [
  {
    selector: '.ant-input-search',
    content: "Use the drop-down menu to select one entity or all entities. Use the search bar to search for text within your selection."
  },
  {
    selector: '.ant-layout-sider',
    content: 'Here are the available faceted search options. Entity Properties are per selected entity. Hub Properties are per document.'
  },
  {
    selector: '.ant-list-item',
    content: 'Document results include entity name, primary key (or document URI), snippet information, and metadata. Click the primary key (or document URI) to view the document.'
  }
];

const detailSteps = [
  {
    selector: '#header',
    content: 'Here is the entity name, primary key (or document URI), and metadata.'
  },
  {
    selector: '[class*="Detail_menu"]',
    content: 'Switch between a table view of harmonized instance data and raw JSON/XML data.'
  }
];

const loginSteps = [
  {
    selector: '.ant-form-horizontal',
    content: 'Enter log-in information.'
  }
];

export {
  browseSteps, 
  viewSteps,
  detailSteps,
  loginSteps
} ;