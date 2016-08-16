import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { HubSettings } from './hub-settings.model';

@Injectable()
export class EnvironmentService {

  public settings: HubSettings;

  constructor(private http: Http) {}

  public getEnvironment(): Observable<boolean> {
    const projectId = localStorage.getItem('_projectId_');
    const environment = localStorage.getItem('_environment_');

    return this.http.get(`/projects/${projectId}/${environment}`).map(res => {
      const json = res.json();
      this.settings = json['mlSettings'];
      return true;
    });
  }
}
