import { Injectable } from '@angular/core';
import { Http, Response, ResponseType } from '@angular/http';

@Injectable()
export class SearchService {
  constructor(private http: Http) {}

  getResults(database: string, query: string, activeFacets: any, page: number, pageLength: number) {
    let start: number = (page - 1) * pageLength + 1;
    let data = {
      database: database,
      query: query,
      start: start,
      count: pageLength,
    };

    for (let key of Object.keys(activeFacets)) {
      for (let value of activeFacets[key].values) {
        data[key] = value;
      }
    }

    return this.post(`/api/search`, data);
  }

  getDoc(database: string, docUri: string) {
    return this.get(`/api/search/doc?database=${database}&docUri=${docUri}`);
  }

  private extractData = (res: Response) => {
    if (res.headers.get('content-type').startsWith('application/json')) {
      return res.json();
    }
    return res.text();
  }

  private get(url: string) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).map(this.extractData);
  }
}
