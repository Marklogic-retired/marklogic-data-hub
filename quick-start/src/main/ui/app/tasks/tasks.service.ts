import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TaskService {
  constructor(private http: Http) {}

  getTasks() {
    return this.get('/tasks/');
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
