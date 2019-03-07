import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, ResponseContentType} from '@angular/http';
import {map} from 'rxjs/operators';

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

  exportJobs(jobIds: string[]) {
    let options: RequestOptions = new RequestOptions();
    options.responseType = ResponseContentType.Blob;

    return this.http.post(
      '/api/jobs/export',
      JSON.stringify(
        {
          "jobIds": jobIds.length ===0 ? null : jobIds
        }
      ),
      options
    );
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private post(url: string, data: any) {
    return this.http.post(url, data).pipe(map(this.extractData));
  }
}
