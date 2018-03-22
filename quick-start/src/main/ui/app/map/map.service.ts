import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Map } from './map.model';

import * as _ from 'lodash';

@Injectable()
export class MapService {

  maps: Array<Map>;

  constructor(
    private http: Http,
  ) {}

  getMaps() {
    this.http.get(this.url('/maps/')).map((res: Response) => {
      let maps: Array<any> = res.json();
      return maps.map((map) => {
        return new Map().fromJSON(map);
      });
    }).subscribe((maps: Array<Map>) => {
      this.maps = maps;
      //this.entitiesChange.emit(this.entities);
      //this.extractTypes();
    });
  }

}
