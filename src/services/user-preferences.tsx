interface UserPreferences {
  query: string,
  entityNames: string[],
  pageLength: number,
  facets: any,
  tableView: boolean,
  pageRoute: string,
  resultTableColumns: TableColumns[]
}

interface TableColumns {
  entity: string,
  columns: string[]
}

export const defaultUserPreferences = {
  query: '',
  entityNames: [],
  pageLength: 20,
  facets: {},
  tableView: true,
  pageRoute: '/view',
  resultTableColumns: []
}

export const createUserPreference = (username: string) => {
  const newUserPreference: UserPreferences = defaultUserPreferences;
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(newUserPreference));
  return;
}

export const getUserPreferences = (username: string) => {
  return localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
}

export const updateSearchPreference = (username :any, searchOptions: any) => {
  const currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
  console.log('current pref', currentPreferences);
  return;
}

export const updateUIPreference = (username :any, uiOption: any) => {
  const currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
  console.log('current pref', currentPreferences);

  console.log('ui option', uiOption);
  return;
}
