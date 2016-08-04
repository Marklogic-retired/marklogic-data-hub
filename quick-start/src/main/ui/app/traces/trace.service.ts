import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class TraceService {
  constructor(private http: Http) {}

  getTraces(query: string, page: number, pageLength: number) {
    let start: number = (page - 1) * pageLength + 1;
    return this.get(`/api/traces/?query=${query}&start=${start}&count=${pageLength}`);
  }

  getTrace(traceId: string) {
    return this.get(`/api/traces/${traceId}`);
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
