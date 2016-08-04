import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class JobService {
  start: number = 1;
  count: number = 10;

  constructor(private http: Http) {}

  getJobs() {
    return this.get(`/api/jobs/?start=${this.start}&count=${this.count}`);
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private get(url) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url, data) {
    return this.http.post(url, data).map(this.extractData);
  }
}
