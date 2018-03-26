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

  getMaps(entityName) {
    this.http.get(this.url('/entities/{{entityName}}/maps')).map((res: Response) => {
      let maps: Array<any> = res.json();
      console.log('GET /entities/' + entityName + '/maps', maps);
      return maps;
    }).subscribe((maps: any) => {
      this.maps = maps;
      console.log('Result: ', maps);
    });
  }

  getMap(entityName, mapName) {
    this.http.get(this.url('/entities/{{entityName}}/maps/{{mapName}}')).map((res: Response) => {
      let map: Array<any> = res.json();
      console.log('GET /entities/' + entityName + '/maps' + mapName, map);
      return map;
    }).subscribe((map: any) => {
      this.map = map;
      console.log('Result: ', map);
    });
  }

  saveMap(entityName, mapName, map) {
    this.http.post(this.url('/entities/{{entityName}}/maps/{{mapName}}'), JSON.parse(map)).map((res: Response) => {
      console.log('POST /entities/' + entityName + '/maps' + mapName, map);
      return res;
    }).subscribe((res: any) => {
      console.log('Result: ', res);
    });
  }

  deleteMap(entityName, mapName) {
    this.http.delete(this.url('/entities/{{entityName}}/maps/{{mapName}}')).map((res: Response) => {
      console.log('DELETE /entities/' + entityName + '/maps' + mapName);
      return res;
    }).subscribe((res: any) => {
      console.log('Result: ', res);
    });
  }

  private url(u: string): string {
    return `/api/current-project${u}`;
  }

}
