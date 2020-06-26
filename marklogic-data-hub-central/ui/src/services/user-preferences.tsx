interface UserPreferences {
  query: {
    searchText: string,
    entityTypeIds: string[],
    selectedFacets: any
  },
  pageLength: number,
  tableView: boolean,
  // pageRoute: string,
  resultTableColumns: any[],
  selectedQuery: string
}

export const defaultUserPreferences = {
  query: {
    searchText: '',
    entityTypeIds: [],
    selectedFacets: {}
  },
  pageLength: 20,
  tableView: true,
  // pageRoute: '/view',
  resultTableColumns: [],
  selectedQuery: 'select a query'
}

export const createUserPreferences = (username: string) => {
  const newUserPreference: UserPreferences = defaultUserPreferences;
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(newUserPreference));
  return;
}

export const getUserPreferences = (username: string): string => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`) || 'null';
  if (currentPreferences !== 'null') {
    let parsedPreferences = JSON.parse(currentPreferences);
    if (parsedPreferences && parsedPreferences.hasOwnProperty('entityTypeIds')) {
      // old preferences, replace with new default preferences
      createUserPreferences(username);
      return JSON.stringify(defaultUserPreferences);
    }
  } else {
    createUserPreferences(username);
    return JSON.stringify(defaultUserPreferences);
  }
  return currentPreferences ? currentPreferences : '';
}

export const updateUserPreferences = (username: string, newPreferences: any) => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`) || 'null';
  let parsedPreferences = currentPreferences !== 'null' ? JSON.parse(currentPreferences) : null;

  if (parsedPreferences && parsedPreferences.hasOwnProperty('entityTypeIds')) {
    // old preferences, use defaultUser preferences
    parsedPreferences = { ...defaultUserPreferences }
  }
  let updatedPreferences = { ...parsedPreferences, ...newPreferences }
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(updatedPreferences));
}

export const updateTablePreferences = (username: string, entity: string, tableColumns: any ) => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`) || 'null';
  let parsedPreferences = currentPreferences !== 'null' ? JSON.parse(currentPreferences) : null;
  if (parsedPreferences) {
    let index = parsedPreferences['resultTableColumns'].findIndex( item => item.name === entity);
    let tableObject = {
      name: entity,
      columns: tableColumns
    }
    if (index >= 0) {
      parsedPreferences.resultTableColumns[index] = tableObject; 
    } else {
      parsedPreferences.resultTableColumns.push(tableObject);
    }
    localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(parsedPreferences));
  }
}