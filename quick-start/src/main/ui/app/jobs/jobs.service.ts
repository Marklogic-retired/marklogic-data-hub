import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class JobService {
  constructor(private http: Http) {}

  getJobs(query: string, activeFacets: any, page: number, pageLength: number) {
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

    return this.post(`/api/jobs`, data);
  }

  deleteJobs(jobIds: string[]) {
    return this.http.post('/api/jobs/delete', jobIds.join(","));
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).map(this.extractData);
  }
}
