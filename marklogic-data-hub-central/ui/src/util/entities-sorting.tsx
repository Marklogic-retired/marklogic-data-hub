export const entitiesSorting = (entities: any[]) => {
  return entities.sort((e1, e2) => {
    if (e1 > e2) {
      return 1;
    }
    if (e1 < e2) {
      return -1;
    }
    return 0;
  });

};