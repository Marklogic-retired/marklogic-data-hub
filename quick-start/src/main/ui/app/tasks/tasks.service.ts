import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth';

@Injectable()
export class TaskService {
  constructor(
    private http: Http,
    private auth: AuthService
  ) {}

  getTasks() {
    return this.get('/tasks/');
  }

  private extractData = (res: Response) => {
    if (!this.auth.isAuthenticated()) {
      this.auth.setAuthenticated(true);
    }
    return res.json();
  }

  private get(url) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url, data) {
    return this.http.post(url, data).map(this.extractData);
  }
}
