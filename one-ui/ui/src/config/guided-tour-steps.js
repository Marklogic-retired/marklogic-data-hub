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

const browseTableViewSteps = [
  {
    selector: '.ant-input-search',
    content: "Use the drop-down menu to select one entity or all entities. Use the search bar to search for text within your selection."
  },
  {
    selector: '[id*="sideBarContainer"]',
    content: 'Here are the available faceted search options. Entity Properties are per selected entity. Hub Properties are per document.'
  },
  {
    selector: '[id*="snippetView"]',
    content: 'You are currently in table view. Click on this button to switch to snippet view'
  },
  {
    selector: '.ant-table-row',
    content: 'Document results include entity name, primary key (or document URI), table information, and metadata'
  },
  {
    selector: '.ant-table-row-expand-icon-cell',
    content: 'Expansion button will show all the properties of each document'
  },
  {
    selector: '[id*="instance"]',
    content: 'Click on this to see instance view of the document on a separate page'
  },
  {
    selector: '[id*="source"]',
    content: 'Click on this to see source view of the document on a separate page'
  }

];

const browseSnippetViewSteps = [
  {
    selector: '.ant-input-search',
    content: "Use the drop-down menu to select one entity or all entities. Use the search bar to search for text within your selection."
  },
  {
    selector: '[id*="sideBarContainer"]',
    content: 'Here are the available faceted search options. Entity Properties are per selected entity. Hub Properties are per document.'
  },
  {
    selector: '[id*="tableView"]',
    content: 'You are currently in snippet view. Click on this button to switch to table view'
  },
  {
    selector: '.ant-list-item',
    content: 'Document results include entity name, primary key (or document URI), snippet information, and metadata'
  },
  {
    selector: '[class*="search-result_title"]',
    content: 'Expansion button will show all the properties of each document'
  },
  {
    selector: '[id*="instance"]',
    content: 'Click on this to see instance view of the document on a separate page'
  },
  {
    selector: '[id*="source"]',
    content: 'Click on this to see source view of the document on a separate page'
  }

];

const detailSteps = [
  {
    selector: '#header',
    content: 'Here is the entity name, primary key (or document URI), and metadata.'
  },
  {
    selector: '#subMenu',
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
  browseTableViewSteps,
  browseSnippetViewSteps,
  viewSteps,
  detailSteps,
  loginSteps
} ;