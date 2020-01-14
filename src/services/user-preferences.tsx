interface UserPreferences {
  query: string,
  entityNames: string[],
  pageLength: number,
  facets: any,
  tableView: boolean,
  pageRoute: string,
  resultTableColumns: any[]
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

export const createUserPreferences = (username: string) => {
  const newUserPreference: UserPreferences = defaultUserPreferences;
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(newUserPreference));
  return;
}

export const getUserPreferences = (username: string) => {
  return localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
}

export const updateUserPreferences = (username: string, newPreferences: any) => {
  let currentPreferences = localStorage.getItem(`dataHubExplorerUserPreferences-${username}`);
  let parsedPreferences = JSON.parse(currentPreferences ? currentPreferences : '');
  let updatedPreferences = {...parsedPreferences, ...newPreferences}
  localStorage.setItem(`dataHubExplorerUserPreferences-${username}`, JSON.stringify(updatedPreferences));
  return;
}