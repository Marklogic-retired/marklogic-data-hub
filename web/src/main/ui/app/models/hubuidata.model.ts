export class HubUIData {
  x: number;
  y: number;
  width: number;
  height: number;

  vertices: any = {};

  fromJSON(json) {
    this.x = json.x;
    this.y = json.y;
    this.width = json.width;
    this.height = json.height;
    this.vertices = json.vertices || {};

    return this;
  }
}
