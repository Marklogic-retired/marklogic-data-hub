export const getFromPath = (path, object) => {
  let val = object;
  for (let i = 0; i < path.length; i++) {
    if (val == null) {
      return;
    }
    val = val[path[i]];
  }

  return val;
};
