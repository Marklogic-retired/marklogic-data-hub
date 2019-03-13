import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Mapping } from './mapping.model';
import {map} from 'rxjs/operators';

import * as _ from 'lodash';
import {Entity} from "../../models";

@Injectable()
export class MapService {

  maps: Array<Mapping> = new Array<Mapping>();
  mappingsChange: EventEmitter<Array<Mapping>> = new EventEmitter<Array<Mapping>>();
  map: any;

  constructor(
    private http: Http,
  ) {
  }

  ngOnInit(){
    this.getMappings();
  }

  getName(entityName, flowName) {
    return encodeURI(entityName + '-' + flowName);
  }

  getMappings() {
    return this.http.get(this.url('/mappings')).pipe(map((res: Response) => {
      let mappings: Array<any> = res.json();
      return mappings.map((map) => {
        return new Mapping().fromJSON(map);
      });
    })).subscribe((mappings: Array<Mapping>) => {
      this.maps = mappings;
      this.mappingsChange.emit(this.maps);
    });
  }

  getMappingsByEntity(entity: Entity) {
    if(!entity.info.baseUri){
      entity.info.baseUri = "http://example.org/"
    }
    let entityName = entity.info.baseUri.trim() + entity.name+'-' + entity.info.version + '/' + entity.name;

    return this.maps.filter((mapping) => {
      return mapping.targetEntityType.toLocaleLowerCase() == entityName.toLocaleLowerCase();
    });
  }

  getMap(mapName) {
    return this.http.get(this.url('/mappings/' + mapName)).pipe(map((res: Response) => {
      let map: Array<any> = res.json();
      console.log('GET /mappings/' + mapName, map);
      return map;
    }))
  }

  saveMap(mapName, map) {
    let parsedMap = JSON.parse(map);
    return this.http.post(this.url('/mappings/' + mapName), parsedMap).pipe(map((res: Response) => {
      console.log('POST /mappings/' + mapName, map);
      return res;
    }))
  }

  deleteMap(mapping: Mapping) {
    _.remove(this.maps, { 'name': mapping.name });
    this.mappingsChange.emit(this.maps);
    return  this.http.delete(this.url('/mappings/' + mapping.name)).pipe(map((res: Response) => {
      console.log('DELETE /mappings/' + mapping.name);
      return res;
    }))
  }

  private url(u: string): string {
    return `/api/current-project${u}`;
  }

}
