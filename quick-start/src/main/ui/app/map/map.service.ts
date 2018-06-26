import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Map } from './map.model';

import * as _ from 'lodash';

@Injectable()
export class MapService {

  maps: Array<Map>;
  map: any;

  constructor(
    private http: Http,
  ) {}

  getName(entityName, flowName) {
    return encodeURI(entityName + '-' + flowName + '-' + 'map');
  }

  getMaps() {
    this.http.get(this.url('/mappings')).map((res: Response) => {
      let maps: Array<any> = res.json();
      return maps;
    }).subscribe((maps: any) => {
      this.maps = maps;
      console.log('Result: ', maps);
    });
  }

  getMap(mapName) {
    this.http.get(this.url('/mappings/{{mapName}}')).map((res: Response) => {
      let map: Array<any> = res.json();
      console.log('GET /mappings' + mapName, map);
      return map;
    }).subscribe((map: any) => {
      this.map = map;
      console.log('Result: ', map);
    });
  }

  saveMap(mapName, map) {
    this.http.post(this.url('/mappings/{{mapName}}'), JSON.parse(map)).map((res: Response) => {
      console.log('POST /mappings' + mapName, map);
      return res;
    }).subscribe((res: any) => {
      console.log('Result: ', res);
    });
  }

  deleteMap(mapName) {
    this.http.delete(this.url('/mappings/{{mapName}}')).map((res: Response) => {
      console.log('DELETE /mappings' + mapName);
      return res;
    }).subscribe((res: any) => {
      console.log('Result: ', res);
    });
  }

  private url(u: string): string {
    return `/api/current-project${u}`;
  }

}
