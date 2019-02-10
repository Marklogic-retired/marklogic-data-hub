export class Serializable {
  fromJSON(json) {
    for (var propName in json) {
      this[propName] = json[propName];
    }
    return this;
  }
}
