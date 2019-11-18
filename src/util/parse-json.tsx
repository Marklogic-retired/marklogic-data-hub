let counter = 0;
export const parseJson = (obj: Object) => {
  let parsedData = new Array();
  for (var i in obj) {
    if (obj[i] !== null && typeof (obj[i]) === "object") {
      parsedData.push({ key: counter++, property: i, children: parseJson(obj[i]) });
    } else {
      parsedData.push({ key: counter++, property: i, value: typeof obj[i] === 'boolean' ? obj[i].toString() : obj[i] });
    }
  }
  return parsedData;
}