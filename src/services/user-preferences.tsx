interface UserPreferences {
  query: {
    searchStr: string,
    entityNames: string[],
    facets: any
  },
  pageLength: number,
  tableView: boolean,
  pageRoute: string,
  resultTableColumns: any[]
}

export const defaultUserPreferences = {
  query: {
    searchStr: '',
    entityNames: [],
    facets: {}
  },
  pageLength: 20,
  tableView: true,
  pageRoute: '/view',
  resultTableColumns: []
}

export const createUserPreferences = (username: string) => {
  const newUserPreference: UserPreferences = defaultUserPreferences;
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(newUserPreference));
  return;
}

export const getUserPreferences = (username: string): string => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);

  if (currentPreferences) {
    let parsedPreferences = JSON.parse(currentPreferences);
    if (parsedPreferences.hasOwnProperty('entityNames')) {
      // old preferences, replace with new default preferences
      createUserPreferences(username);
      return JSON.stringify(defaultUserPreferences);
    }
  }

  return currentPreferences ? currentPreferences : '';
}

export const updateUserPreferences = (username: string, newPreferences: any) => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
  let parsedPreferences = JSON.parse(currentPreferences ? currentPreferences : '');

  if (parsedPreferences.hasOwnProperty('entityNames')) {
    // old preferences, use defaultUser preferences
    parsedPreferences = { ...defaultUserPreferences }
  }
  let updatedPreferences = { ...parsedPreferences, ...newPreferences }
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(updatedPreferences));
  
  return;
}

export const updateTablePreferences = (username: string, entity: string, tableColumns: any ) => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
  let parsedPreferences: UserPreferences = JSON.parse(currentPreferences ? currentPreferences : '');
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
  
  return;
}