export const entitiesSorting = (entities: any[]) => {
  return entities?.sort((e1, e2) => {
    if (e1 > e2) {
      return 1;
    }
    if (e1 < e2) {
      return -1;
    }
    return 0;
  });
};

export const baseEntitiesSorting = (entities: any[]) => {
  return entities?.sort((e1, e2) => {
    if (!e2.name) {
      return -1;
    }
    if (e1.name > e2.name) {
      return 1;
    }
    if (e1.name < e2.name) {
      return -1;
    }
    return 0;
  });
};
