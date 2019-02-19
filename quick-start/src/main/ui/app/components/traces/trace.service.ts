import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import {map} from 'rxjs/operators';

@Injectable()
export class TraceService {
  constructor(private http: Http) {}

  getTraces(query: string, activeFacets: any, page: number, pageLength: number) {
    let start: number = (page - 1) * pageLength + 1;
    let data = {
      query: query,
      start: start,
      count: pageLength,
    };

    for (let key of Object.keys(activeFacets)) {
      for (let value of activeFacets[key].values) {
        data[key] = value;
      }
    }

    return this.post(`/api/traces`, data);
  }

  getTrace(traceId: string) {
    return this.get(`/api/traces/${traceId}`);
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private get(url: string) {
    return this.http.get(url).pipe(map(this.extractData));
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).pipe(map(this.extractData));
  }
}
