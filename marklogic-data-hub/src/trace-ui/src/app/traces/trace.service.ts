import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TraceService {
  constructor(private http: Http) {}

  getTraces(query: string, activeFacets: any, page: number, pageLength: number) {
    let start: number = (page - 1) * pageLength + 1;
    const url = `/v1/search?options=traces&format=json&transform=mlTraceSearchResults&start=${start}&pageLength=${pageLength}`;
    let queries = [];
    if (query && query !== '') {
      queries.push({
        'term-query' : [ { 'text' : query} ]
      });
    }

    for (let key of Object.keys(activeFacets)) {
      for (let value of activeFacets[key].values) {
        queries.push({
          'range-constraint-query': {
            'constraint-name': key,
            value: value,
            'range-operator': 'EQ'
          }
        });
      }
    }

    const body = {
      query: {
        queries: [{
            'and-query': queries
        }, {
          'operator-state': {
            'operator-name': 'sort',
            'state-name': 'date-desc'
          }
        }]
      }
    };
    return this.post(url, body);
  }

  getTrace(traceId: string) {
    return this.get(`/hub/traces/${traceId}`);
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private get(url: string) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url: string, body) {
    return this.http.post(url, body).map(this.extractData);
  }
}
