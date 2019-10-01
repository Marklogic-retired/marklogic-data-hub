// Steps for guided tour depending on each view.
const viewSteps = [
  {
    selector: '[class*="View_statsContainer"]',
    content: 'Here are the number of entities and total number of documents'
  },
  {
    selector: '.ant-table-body',
    content: 'The table shows each entity, total documents per entity, and last harmonized date.'
  },
  {
    selector: '.ant-table-row-expand-icon',
    content: 'Expansion button will show all the properties of each entity.'
  }
];

const browseSteps = [
  {
    selector: '.ant-input-search',
    content: "Use the dropdown to select an individual entity. The search bar uses the MarkLogic's built in search engine."
  },
  {
    selector: '.ant-layout-sider',
    content: 'Here are the available faceted search options. Entity Properties are per selected entity. Hub Property facets are available below.'
  },
  {
    selector: '.ant-list-item',
    content: 'Document results include entity name, primary key (or document URI), snippet information, and metadata'
  }
];

const detailSteps = [
  {
    selector: '#header',
    content: 'Document metadata'
  },
  {
    selector: '[class*="Detail_menu"]',
    content: 'Switch between seeing a table view of harmonized instance data and raw data.'
  }
];

const loginSteps = [
  {
    selector: '.ant-form-horizontal',
    content: 'Enter Login information'
  }
];

export {
  browseSteps, 
  viewSteps,
  detailSteps,
  loginSteps
} ;