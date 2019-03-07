import { Injectable } from '@angular/core';
import { Http, Response, ResponseType } from '@angular/http';
import {map} from 'rxjs/operators';

@Injectable()
export class SearchService {
  constructor(private http: Http) {}

  getResults(database: string, entitiesOnly: boolean, query: string, activeFacets: any, page: number, pageLength: number) {
    let start: number = (page - 1) * pageLength + 1;
    let data = {
      database: database,
      entitiesOnly: entitiesOnly,
      query: query,
      start: start,
      count: pageLength,
    };

    let facets = {};
    for (let key of Object.keys(activeFacets)) {
      if (activeFacets[key].values) {
        facets[key] = []
      }
      for (let value of activeFacets[key].values) {
        facets[key].push(value);
      }
    }

    data['facets'] = facets;

    return this.post(`/api/search`, data);
  }

  getDoc(database: string, docUri: string) {
    return this.get(`/api/search/doc?database=${database}&docUri=${encodeURIComponent(docUri)}`);
  }

  private extractData = (res: Response) => {
    if (res.headers.get('content-type').startsWith('application/json')) {
      return res.json();
    }
    return res.text();
  }

  private get(url: string) {
    return this.http.get(url).pipe(map(this.extractData));
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).pipe(map(this.extractData));
  }
}
